"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteAccountAction } from "@/lib/actions/auth";

export function DangerZoneSettings() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await deleteAccountAction();
      // User will be redirected to signup page by the action
    } catch {
      setIsDeleting(false);
      setIsOpen(false);
      toast.error("Failed to delete account", {
        description: "Please try again or contact support.",
      });
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible actions. Proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Delete Account</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Permanently delete your account and all monitors. This cannot be undone.
              Payment records are retained for legal compliance.
            </p>

            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      This action <strong>cannot be undone</strong>. This will permanently delete:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Your account and profile</li>
                      <li>All monitors and their history</li>
                      <li>All incidents and logs</li>
                      <li>All alert configurations</li>
                    </ul>
                    <p className="pt-2">
                      Payment records will be anonymized but retained for tax purposes.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
