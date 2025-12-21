
import { Button } from '@/components/ui/button'
import { signIn } from "@/lib/auth-client"
import { FaGoogle, FaGithub } from 'react-icons/fa'
import Link from 'next/link'
import ResponsiveDialog from './responsive-dialog'


interface SignInDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const SignInDialog = ({
    open,
    onOpenChange
}: SignInDialogProps) => {

    const onSocial = async (provider: 'github' | 'google') => {
        await signIn.social({
            provider,
            callbackURL: '/dashboard'
        })
    }

    return (
        <ResponsiveDialog
            title=' '
            description=' '
            open={open}
            onOpenChange={onOpenChange}
            DialogClassName="w-full max-w-sm md:max-w-[420px] p-0 overflow-hidden bg-transparent border-none shadow-none"
        >
            <div className="flex flex-col items-center gap-6 w-full p-8 md:p-10 glass-card rounded-2xl">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-gradient-primary">
                        Welcome back
                    </h2>
                    <p className="text-sm text-muted-foreground/80 max-w-xs leading-relaxed">
                        Sign in to your account to continue
                    </p>
                </div>

                <div className="w-full flex flex-col gap-3">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full relative h-12 rounded-xl text-base font-medium hover:bg-white/10 hover:text-foreground transition-all duration-300 border-white/10 bg-white/5 backdrop-blur-sm shadow-none"
                        onClick={() => onSocial('google')}
                    >
                        <FaGoogle className="mr-3 text-lg" />
                        Continue with Google
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-12 rounded-xl text-base font-medium hover:bg-white/10 hover:text-foreground transition-all duration-300 border-white/10 bg-white/5 backdrop-blur-sm shadow-none"
                        onClick={() => onSocial('github')}
                    >
                        <FaGithub className="mr-3 text-lg" />
                        Continue with GitHub
                    </Button>
                </div>

                <div className="relative w-full text-center my-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/40" />
                    </div>
                    <span className="relative z-10 bg-background/0 px-3 text-xs uppercase text-muted-foreground/70 font-medium tracking-wider backdrop-blur-xl">
                        Or
                    </span>
                </div>
                <Link
                    href="/signup"
                    className="text-primary font-semibold hover:text-primary/80 hover:underline underline-offset-4 transition-all"
                    onClick={() => onOpenChange(false)}
                >
                    Create an account
                </Link>
            </div>
        </ResponsiveDialog>
    )
}

export default SignInDialog