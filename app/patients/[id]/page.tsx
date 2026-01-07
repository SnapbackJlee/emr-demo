"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { fadeIn, slideUp, slideDown, staggerContainer, staggerItem, scaleIn, smoothTransition } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart,
  ArrowLeft,
  LogOut,
  User,
  AlertCircle,
  Loader2,
  Edit,
  Save,
  X,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
} from "lucide-react";

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  dob: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
};

type Allergy = {
  id: string;
  patient_id: string;
  allergen_name: string;
  severity: string | null;
  reaction: string | null;
  created_at: string;
  updated_at?: string | null;
};

type Note = {
  id: string;
  patient_id: string;
  note_text: string;
  created_at: string;
  updated_at?: string | null;
  signed_at?: string | null;
};

function fmt(ts: string | null | undefined) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

function calcAge(dobStr: string | null) {
  if (!dobStr) return "—";
  const birth = new Date(dobStr);
  if (Number.isNaN(birth.getTime())) return "—";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(age);
}

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = (params?.id as string) || "";

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // allergies
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [editingAllergies, setEditingAllergies] = useState(false);
  const [allergiesDraft, setAllergiesDraft] = useState("");
  const [savingAllergies, setSavingAllergies] = useState(false);

  // notes
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // delete patient
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const title = useMemo(() => {
    if (!patient) return "Patient";
    return `${patient.last_name}, ${patient.first_name}`;
  }, [patient]);

  const loadPatient = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("patients")
      .select("id, first_name, last_name, dob, status, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error) throw error;

    const p = data as Patient;
    setPatient(p);
    setEditingAllergies(false);
  }, []);

  const loadAllergies = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("allergies")
      .select("id, patient_id, allergen_name, severity, reaction, created_at, updated_at")
      .eq("patient_id", id)
      .order("allergen_name", { ascending: true });

    if (error) throw error;
    
    const allergyList = (data as Allergy[]) ?? [];
    setAllergies(allergyList);
    // Set draft to display format (one per line)
    setAllergiesDraft(allergyList.map(a => a.allergen_name).join("\n"));
  }, []);

  const loadNotes = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("notes")
      .select("id, patient_id, note_text, created_at, updated_at, signed_at")
      .eq("patient_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    setNotes((data as Note[]) ?? []);
  }, []);

  const loadAll = useCallback(async (id: string) => {
    setErr(null);
    setLoading(true);
    try {
      await Promise.all([loadPatient(id), loadAllergies(id), loadNotes(id)]);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load patient.");
    } finally {
      setLoading(false);
    }
  }, [loadPatient, loadAllergies, loadNotes]);

  useEffect(() => {
    if (!patientId) return;
    void loadAll(patientId);
  }, [patientId, loadAll]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const saveAllergies = useCallback(async () => {
    if (!patientId) return;

    setSavingAllergies(true);
    setErr(null);

    try {
      // Parse the draft text into individual allergen names (one per line)
      const allergenNames = allergiesDraft
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Get current allergies to compare
      const currentAllergenNames = new Set(allergies.map(a => a.allergen_name.toLowerCase()));
      const newAllergenNames = new Set(allergenNames.map(name => name.toLowerCase()));

      // Find allergies to delete (in current but not in new)
      const toDelete = allergies.filter(
        a => !newAllergenNames.has(a.allergen_name.toLowerCase())
      );

      // Find allergies to add (in new but not in current)
      const toAdd = allergenNames.filter(
        name => !currentAllergenNames.has(name.toLowerCase())
      );

      // Delete removed allergies
      if (toDelete.length > 0) {
        const { error } = await supabase
          .from("allergies")
          .delete()
          .in("id", toDelete.map(a => a.id));

        if (error) throw error;
      }

      // Add new allergies
      if (toAdd.length > 0) {
        const newAllergies = toAdd.map(allergen_name => ({
          patient_id: patientId,
          allergen_name,
          // Don't set severity - let it use the database default or remain null
        }));

        const { error } = await supabase.from("allergies").insert(newAllergies);

        if (error) throw error;
      }

      // Reload allergies to get updated list
      await loadAllergies(patientId);
      setEditingAllergies(false);
    } catch (e: any) {
      setErr(e?.message ?? "Could not save allergies.");
    } finally {
      setSavingAllergies(false);
    }
  }, [patientId, allergiesDraft, allergies, loadAllergies]);

  const addNote = useCallback(async () => {
    if (!noteText.trim()) return;

    setSavingNote(true);
    setErr(null);

    try {
      const { error } = await supabase.from("notes").insert({
        patient_id: patientId,
        note_text: noteText.trim(),
      });

      if (error) throw error;

      setNoteText("");
      await loadNotes(patientId);
    } catch (e: any) {
      setErr(e?.message ?? "Could not add note.");
    } finally {
      setSavingNote(false);
    }
  }, [noteText, patientId, loadNotes]);

  const deletePatient = useCallback(async () => {
    if (!patientId) return;

    setDeleting(true);
    setErr(null);

    try {
      // Use the database function to delete patient safely
      const { error } = await supabase.rpc("delete_patient", {
        patient_uuid: patientId,
      });

      if (error) throw error;

      // Redirect to patients list
      router.push("/patients");
    } catch (e: any) {
      setErr(e?.message ?? "Could not delete patient.");
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  }, [patientId, router]);

  return (
    <motion.div
      className="flex min-h-screen flex-col"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
      transition={smoothTransition}
    >
      {/* Navigation */}
      <motion.nav
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        variants={slideDown}
        transition={smoothTransition}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/patients">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to Patients</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence>
            {err && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={smoothTransition}
              >
                <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{err}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                className="flex items-center justify-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </motion.div>
            )}
            {!loading && !patient && (
              <motion.div
                key="not-found"
                variants={scaleIn}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">Patient not found</h3>
                    <p className="mb-4 text-center text-muted-foreground">
                      The patient record you're looking for doesn't exist.
                    </p>
                    <Button asChild>
                      <Link href="/patients">Back to Patients</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {!loading && patient && (
              <motion.div
                key="patient"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {/* Patient Info Card */}
                <motion.div variants={staggerItem}>
                  <Card className="mb-6">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="text-2xl sm:text-3xl">{title}</CardTitle>
                      <CardDescription className="mt-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            patient.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : patient.status === "discharged"
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </CardDescription>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Patient
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Age</p>
                        <p className="text-sm text-muted-foreground">{calcAge(patient.dob)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Date of Birth</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.dob ? new Date(patient.dob).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-sm text-muted-foreground">{fmt(patient.created_at)}</p>
                      </div>
                    </div>
                    {patient.updated_at && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Updated</p>
                          <p className="text-sm text-muted-foreground">{fmt(patient.updated_at)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
                </motion.div>

                {/* Allergies Card */}
                <motion.div variants={staggerItem}>
                  <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-primary" />
                        Allergies
                      </CardTitle>
                      <CardDescription>Patient allergy information</CardDescription>
                    </div>
                    {!editingAllergies ? (
                      <Button variant="outline" size="sm" onClick={() => setEditingAllergies(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAllergies(false);
                            setAllergiesDraft(allergies.map(a => a.allergen_name).join("\n"));
                          }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveAllergies} disabled={savingAllergies}>
                          {savingAllergies ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!editingAllergies ? (
                    <div className="rounded-lg border bg-muted/50 p-4">
                      {allergies.length > 0 ? (
                        <ul className="space-y-1">
                          {allergies.map((allergy) => (
                            <li key={allergy.id} className="text-sm">
                              <span className="font-medium">{allergy.allergen_name}</span>
                              {allergy.severity && allergy.severity !== "moderate" && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({allergy.severity})
                                </span>
                              )}
                              {allergy.reaction && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  - {allergy.reaction}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No allergies listed.</p>
                      )}
                    </div>
                  ) : (
                    <Textarea
                      value={allergiesDraft}
                      onChange={(e) => setAllergiesDraft(e.target.value)}
                      rows={4}
                      placeholder="List allergies one per line, for example:&#10;Peanuts&#10;Penicillin"
                      className="min-h-[100px]"
                    />
                  )}
                </CardContent>
              </Card>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Separator className="mb-6" />
                </motion.div>

                {/* Notes Section */}
                <motion.div className="mb-6" variants={staggerItem}>
                  <h2 className="mb-4 text-2xl font-bold">Clinical Notes</h2>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Add New Note</CardTitle>
                    <CardDescription>Create a new clinical progress note</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Write a progress note..."
                      rows={5}
                      className="mb-4"
                    />
                    <Button onClick={addNote} disabled={savingNote || !noteText.trim()}>
                      {savingNote ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Add Note
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {notes.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 text-lg font-semibold">No notes yet</h3>
                      <p className="text-center text-muted-foreground">
                        Start documenting patient care by adding your first note.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <motion.div
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {notes.map((n, index) => (
                      <motion.div
                        key={n.id}
                        variants={staggerItem}
                        whileHover={{ scale: 1.01 }}
                        transition={smoothTransition}
                      >
                        <Card>
                          <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">Note</CardTitle>
                            {n.signed_at && (
                              <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Signed
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4 whitespace-pre-wrap text-sm">{n.note_text}</div>
                          <Separator className="my-4" />
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">Created:</span> {fmt(n.created_at)}
                            </div>
                            {n.updated_at && (
                              <div>
                                <span className="font-medium">Updated:</span> {fmt(n.updated_at)}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Signed:</span>{" "}
                              {n.signed_at ? fmt(n.signed_at) : "—"}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    ))}
                  </motion.div>
                )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Patient</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete <strong>{title}</strong>? This action cannot be undone.
                  This will permanently delete the patient record and all associated allergies and notes.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={deletePatient} disabled={deleting}>
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Patient
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      </main>
    </motion.div>
  );
}
