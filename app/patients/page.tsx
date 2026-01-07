"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { fadeIn, slideUp, slideDown, staggerContainer, staggerItem, scaleIn, smoothTransition } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Heart,
  Plus,
  LogOut,
  User,
  AlertCircle,
  Loader2,
  Users,
  Calendar,
  FileText,
} from "lucide-react";

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  dob: string | null;
  status: string;
  created_at: string;
};

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

function fmt(ts: string) {
  return new Date(ts).toLocaleDateString();
}

export default function PatientsPage() {
  const router = useRouter();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // create form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [status, setStatus] = useState("active");
  const [allergies, setAllergies] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const canSave = useMemo(() => {
    return firstName.trim() && lastName.trim();
  }, [firstName, lastName]);

  useEffect(() => {
    void loadPatients();
  }, []);

  async function loadPatients() {
    setErr(null);
    setLoading(true);

    const { data, error } = await supabase
      .from("patients")
      .select("id, first_name, last_name, dob, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setPatients([]);
    } else {
      setPatients((data as Patient[]) ?? []);
    }

    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function createPatient() {
    if (!canSave) return;

    setErr(null);
    setSaving(true);

    try {
      // Create patient (without allergies field)
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        dob: dob ? dob : null,
        status,
      };

      const { data, error } = await supabase.from("patients").insert(payload).select("id").single();
      if (error) throw error;

      // Add allergies if provided
      if (allergies.trim()) {
        const allergenNames = allergies
          .split("\n")
          .map(line => line.trim())
          .filter(line => line.length > 0);

        if (allergenNames.length > 0 && data?.id) {
          const allergiesToInsert = allergenNames.map(allergen_name => ({
            patient_id: data.id,
            allergen_name,
            // Don't set severity - let it use the database default or remain null
          }));

          const { error: allergiesError } = await supabase
            .from("allergies")
            .insert(allergiesToInsert);

          if (allergiesError) throw allergiesError;
        }
      }

      // reset
      setFirstName("");
      setLastName("");
      setDob("");
      setStatus("active");
      setAllergies("");
      setShowCreateForm(false);

      // refresh + go to new patient
      await loadPatients();
      if (data?.id) router.push(`/patients/${data.id}`);
    } catch (e: any) {
      setErr(e?.message ?? "Could not create patient.");
    } finally {
      setSaving(false);
    }
  }

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
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EMR System</span>
          </Link>
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
          className="mx-auto max-w-6xl"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Header */}
          <motion.div
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            variants={staggerItem}
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Patients</h1>
              <p className="mt-2 text-muted-foreground">Manage your patient records</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              {showCreateForm ? "Cancel" : "Add Patient"}
            </Button>
          </motion.div>

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

          {/* Create Patient Form */}
          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={smoothTransition}
                className="mb-8 overflow-hidden"
              >
                <Card className="mb-8">
              <CardHeader>
                <CardTitle>Add New Patient</CardTitle>
                <CardDescription>Enter patient information to create a new record</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="discharged">Discharged</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="allergies">Allergies (optional)</Label>
                    <Textarea
                      id="allergies"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      rows={3}
                      placeholder="List allergies one per line, e.g.&#10;Peanuts&#10;Penicillin"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createPatient} disabled={!canSave || saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Patient
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={staggerItem}>
            <Separator className="mb-8" />
          </motion.div>

          {/* Patients List */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                className="flex items-center justify-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </motion.div>
            ) : patients.length === 0 ? (
              <motion.div
                key="empty"
                variants={scaleIn}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No patients yet</h3>
                <p className="mb-4 text-center text-muted-foreground">
                  Get started by adding your first patient record.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              </CardContent>
            </Card>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {patients.map((p, index) => (
                  <motion.div
                    key={p.id}
                    variants={staggerItem}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={smoothTransition}
                  >
                    <Card
                      className="cursor-pointer transition-all hover:shadow-md"
                      onClick={() => router.push(`/patients/${p.id}`)}
                    >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {p.last_name}, {p.first_name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              p.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : p.status === "discharged"
                                  ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            }`}
                          >
                            {p.status}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Age: {calcAge(p.dob)}</span>
                      </div>
                      {p.dob && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>DOB: {new Date(p.dob).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Created: {fmt(p.created_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </motion.div>
  );
}
