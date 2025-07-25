"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Shield, Menu, X, User, LogOut, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface NavbarProps {
  onAuthClick?: () => void
}

export default function Navbar({ onAuthClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user, isAuthenticated, logout, deleteAccount } = useAuth()

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await deleteAccount()
    } catch (error) {
      console.error("Failed to delete account:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <header className="border-b border-zinc-800/50 bg-black/80 backdrop-blur-md fixed w-full z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-500" />
            <span className="font-medium text-xl tracking-tight">Truth Intelligence</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-zinc-400 hover:text-white transition-colors font-medium">
              Features
            </Link>
            <Link href="#audience" className="text-zinc-400 hover:text-white transition-colors font-medium">
              For Who
            </Link>
            <Link href="#pricing" className="text-zinc-400 hover:text-white transition-colors font-medium">
              Pricing
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-zinc-400 hover:text-white flex items-center space-x-2 font-medium"
                  >
                    {user?.image ? (
                      <Image
                        src={user.image || "/neon-triangle-logo-grey-bg.png"}
                        alt={user.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="font-medium">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black border-white/20 text-white">
                  <DropdownMenuItem asChild>
                    <Link href="/verify" className="flex items-center space-x-2 font-medium">
                      <Shield className="h-4 w-4" />
                      <span>Verify Content</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 font-medium">
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center space-x-2 text-red-400 hover:text-red-300 font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Account</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" className="text-zinc-400 hover:text-white font-medium" onClick={onAuthClick}>
                  Log in
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium" onClick={onAuthClick}>
                  Sign up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-zinc-400 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-zinc-900 border-b border-zinc-800 fixed top-16 left-0 w-full z-40 overflow-y-auto">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <Link
                href="#features"
                className="text-zinc-400 hover:text-white transition-colors py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#audience"
                className="text-zinc-400 hover:text-white transition-colors py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                For Who
              </Link>
              <Link
                href="#pricing"
                className="text-zinc-400 hover:text-white transition-colors py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="flex flex-col space-y-2 pt-2 border-t border-zinc-800">
                {isAuthenticated ? (
                  <>
                    <div className="text-white/60 text-sm py-2 flex items-center space-x-2 font-medium">
                      {user?.image && (
                        <Image
                          src={user.image || "/neon-triangle-logo-grey-bg.png"}
                          alt={user.name}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      )}
                      <span>Signed in as {user?.name}</span>
                    </div>
                    <Button variant="ghost" className="justify-start font-medium" asChild>
                      <Link href="/verify">
                        <Shield className="h-4 w-4 mr-2" />
                        Verify Content
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start font-medium" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-red-400 hover:text-red-300 font-medium"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start font-medium" onClick={onAuthClick}>
                      Log in
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium" onClick={onAuthClick}>
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-black border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete your account? This action cannot be undone and will permanently remove all
              your data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
