import { sendVerificationEmail } from '@/integrations/supabase/send-verification-email';
import { readBody, type H3Event } from 'h3';

export default async function (event: H3Event) {
    try {
        // 👇 Typage explicite pour TypeScript
        const body = await readBody<{
            email: string;
            token: string;
            firstName?: string;
        }>(event);

        if (!body) {
            return new Response(
                JSON.stringify({ error: "Body manquant" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const { email, token, firstName } = body;

        const appUrl = process.env.APP_URL ?? 'https://irenekiva.netlify.app';

        await sendVerificationEmail({
            email,
            token,
            firstName: firstName ?? '',
            appUrl,
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error('Error in /api/send-verification-email:', err);
        return new Response(JSON.stringify({ error: err?.message ?? String(err) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}