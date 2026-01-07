"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { fadeIn, slideUp, slideDown, staggerContainer, staggerItem, scaleIn, smoothTransition } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Heart, ArrowLeft, LogOut, User, AlertCircle, Loader2, CheckCircle2, Save } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("staff");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      setMsg(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        router.push("/login");
        return;
      }

      const user = session.user;
      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("staff_profiles")
        .select("full_name, role, email")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setFullName((data.full_name ?? "").toString());
        setRole((data.role ?? "staff").toString());
      }

      setLoading(false);
    })();
  }, [router]);

  async function saveProfile() {
    setSaving(true);
    setErr(null);
    setMsg(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
      router.push("/login");
      return;
    }

    const userId = session.user.id;

    const payload = {
      user_id: userId,
      email: session.user.email ?? null,
      full_name: fullName.trim(),
      role: role.trim() || "staff",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("staff_profiles").upsert(payload);

    setSaving(false);

    if (error) {
      setErr(error.message);
      return;
    }

    setMsg("Profile saved successfully!");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
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
            <Button variant="ghost" size="sm" asChild>
              <Link href="/patients">
                <span className="hidden sm:inline">Patients</span>
                <span className="sm:hidden">Home</span>
              </Link>
            </Button>
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
          className="mx-auto max-w-2xl"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div className="mb-8" variants={staggerItem}>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">My Staff Profile</h1>
            <p className="mt-2 text-muted-foreground">Manage your profile information</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="content"
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
                      className="mb-6"
                    >
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{err}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {msg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={smoothTransition}
                      className="mb-6"
                    >
                      <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{msg}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={staggerItem}>
                  <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your staff profile details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Login Email</Label>
                      <Input id="email" value={email || "-"} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">
                        Your login email cannot be changed here. Contact your administrator to update it.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="staff / admin / housing director"
                      />
                      <p className="text-xs text-muted-foreground">
                        For now, this is just a label. We'll enforce real permissions later.
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" asChild>
                        <Link href="/patients">Cancel</Link>
                      </Button>
                      <Button onClick={saveProfile} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </motion.div>
  );
}
