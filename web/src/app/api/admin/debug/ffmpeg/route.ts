import { NextResponse } from "next/server";
import { runFfmpegDiagnosis } from "@/lib/social-engine/diagnose_ffmpeg";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const results = runFfmpegDiagnosis();
        return NextResponse.json(results);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
