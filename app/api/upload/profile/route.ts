export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.json();
        const { image, name } = formData;

        if (!image) {
            return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
        }

        // Handle base64 image
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles');

        try {
            if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }

            const fileName = `${randomUUID()}-${(name || 'profile').replace(/\s+/g, '-')}`;
            const filePath = join(uploadDir, fileName);

            await writeFile(filePath, buffer);

            return NextResponse.json({
                url: `/uploads/profiles/${fileName}`,
                success: true
            });
        } catch (fsError) {
            console.error('Local filesystem upload failed, falling back to Base64 storage:', fsError);

            // On read-only filesystems (like Vercel), we return the base64 data itself.
            // This will be stored in the database and rendered directly.
            return NextResponse.json({
                url: image, // Original data URL (base64)
                success: true,
                isFallback: true
            });
        }
    } catch (error) {
        console.error('Upload catch-all error:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}
