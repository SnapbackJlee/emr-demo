"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Shield, Zap, Users, FileText, Lock, Heart } from "lucide-react";
import { fadeIn, slideUp, slideDown, staggerContainer, staggerItem, scaleIn, smoothTransition } from "@/lib/animations";

export default function Home() {
  return (
    <motion.div
      className="flex min-h-screen flex-col"
      initial="initial"
      animate="animate"
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
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EMR System</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background py-20 sm:py-32"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm"
              variants={staggerItem}
            >
              <Zap className="h-4 w-4 text-primary" />
              <span>Modern Healthcare Management</span>
            </motion.div>
            <motion.h1
              className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              variants={staggerItem}
            >
              Streamline Your
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {" "}
                Medical Practice
              </span>
            </motion.h1>
            <motion.p
              className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl"
              variants={staggerItem}
            >
              A comprehensive Electronic Medical Records system designed for modern healthcare providers.
              Manage patients, notes, and records with ease and security.
            </motion.p>
            <motion.div
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
              variants={staggerItem}
            >
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/signup">
                  Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="#features">Learn More</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        className="py-20 sm:py-32"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to manage your medical practice efficiently
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Patient Management",
                description: "Comprehensive patient records with demographics, medical history, and status tracking.",
              },
              {
                icon: FileText,
                title: "Clinical Notes",
                description: "Create, edit, and sign clinical notes with full audit trails and timestamps.",
              },
              {
                icon: Shield,
                title: "Secure & Compliant",
                description: "Enterprise-grade security with HIPAA-compliant data protection and encryption.",
              },
              {
                icon: Lock,
                title: "Access Control",
                description: "Role-based access control ensures only authorized personnel can access sensitive data.",
              },
              {
                icon: Zap,
                title: "Fast & Reliable",
                description: "Built on modern infrastructure for speed, reliability, and scalability.",
              },
              {
                icon: Heart,
                title: "Allergy Tracking",
                description: "Track patient allergies and medical alerts to ensure safe care delivery.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={smoothTransition}
              >
                <Card>
                  <CardHeader>
                    <feature.icon className="mb-2 h-8 w-8 text-primary" />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="border-t bg-muted/50 py-20 sm:py-32"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={scaleIn}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join healthcare providers who trust our platform for their medical records management.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="border-t py-12"
        variants={slideUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-semibold">EMR System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} EMR System. All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
}
