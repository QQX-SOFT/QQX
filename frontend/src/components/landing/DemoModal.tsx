"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-[#0F172A] text-white border-white/10">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Demo anfordern</DialogTitle>
              <DialogDescription className="text-gray-400">
                Lassen Sie uns Ihnen zeigen, wie QQX Ihr Flottenmanagement revolutionieren kann. 
                Füllen Sie das Formular aus und wir melden uns innerhalb von 24 Stunden bei Ihnen.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstname" className="text-white">Vorname</Label>
                  <Input id="firstname" placeholder="Max" className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="text-white">Nachname</Label>
                  <Input id="lastname" placeholder="Mustermann" className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-white">Unternehmen</Label>
                <Input id="company" placeholder="Firma GmbH" className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">E-Mail Adresse</Label>
                <Input id="email" type="email" placeholder="max@firma.at" className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-white">Nachricht (Optional)</Label>
                <Textarea id="message" placeholder="Erzählen Sie uns kurz von Ihrer Flotte..." className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[100px]" />
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-6 text-lg font-bold" disabled={loading}>
                  {loading ? "Wird gesendet..." : "Demo Jetzt Anfordern"}
                </Button>
              </div>
              <p className="text-[10px] text-gray-500 text-center">
                Durch das Absenden stimmen Sie unseren Datenschutzbestimmungen zu.
              </p>
            </form>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Vielen Dank!</h3>
              <p className="text-gray-400">
                Ihre Anfrage wurde erfolgreich übermittelt. <br />
                Ein QQX Experte wird sich in Kürze bei Ihnen melden.
              </p>
            </div>
            <Button onClick={onClose} variant="outline" className="border-white/10 hover:bg-white/5">
              Schließen
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
