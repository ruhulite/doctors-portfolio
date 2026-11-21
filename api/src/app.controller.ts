
import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

import {
    FileFieldsInterceptor,
    FileInterceptor,
} from '@nestjs/platform-express';

import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { mkdir, unlink } from 'fs/promises';
import { spawn } from 'child_process';

import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';
import { AuthGuard, SuperAdminGuard } from './auth';

// --------------------------------------------------
// UPLOAD CONFIGURATION
// --------------------------------------------------

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const uploadDirectory = join(process.cwd(), uploadDir);

const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 200);
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

const MAX_IMAGE_MB = Number(process.env.MAX_IMAGE_MB || 5);
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

const MAX_VIDEO_DURATION_SECONDS = 300;

if (!Number.isFinite(MAX_UPLOAD_MB) || MAX_UPLOAD_MB <= 0) {
    throw new Error('MAX_UPLOAD_MB must be a positive number.');
}

if (!Number.isFinite(MAX_IMAGE_MB) || MAX_IMAGE_MB <= 0) {
    throw new Error('MAX_IMAGE_MB must be a positive number.');
}

// Create the upload directory before accepting uploads.
const uploadDirectoryReady = mkdir(uploadDirectory, {
    recursive: true,
});

const storage = diskStorage({
    destination: (_req, _file, cb) => {
        uploadDirectoryReady
            .then(() => cb(null, uploadDirectory))
            .catch((error) => cb(error, uploadDirectory));
    },

    filename: (_req, file, cb) =>
        cb(
            null,
            `${randomUUID()}${extname(file.originalname).toLowerCase()}`,
        ),
});

// --------------------------------------------------
// VIDEO DURATION
// --------------------------------------------------

function durationOf(path: string): Promise<number> {
    return new Promise((resolve, reject) => {
        let bin: string;

        try {
            bin = require('ffprobe-static').path;

            if (!bin) {
                throw new Error('FFprobe binary path not found.');
            }
        } catch (error) {
            reject(error);
            return;
        }

        const p = spawn(bin, [
            '-v',
            'error',
            '-show_entries',
            'format=duration',
            '-of',
            'default=noprint_wrappers=1:nokey=1',
            path,
        ]);

        let out = '';
        let err = '';

        p.stdout.on('data', (data) => {
            out += data;
        });

        p.stderr.on('data', (data) => {
            err += data;
        });

        p.on('error', reject);

        p.on('close', (code) => {
            const duration = Number(out.trim());

            if (
                code !== 0 ||
                !Number.isFinite(duration) ||
                duration <= 0
            ) {
                reject(
                    new Error(
                        err || 'Could not read video duration.',
                    ),
                );
            } else {
                resolve(duration);
            }
        });
    });
}

// --------------------------------------------------
// VIDEO URL VALIDATION
// --------------------------------------------------

function parseVideoUrl(input: string): URL {
    try {
        const url = new URL(input.trim());

        if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error();
        }

        if (url.username || url.password) {
            throw new Error();
        }

        return url;
    } catch {
        throw new BadRequestException(
            'A valid video URL is required.',
        );
    }
}

function isYouTubeUrl(url: URL): boolean {
    return (
        url.hostname === 'youtube.com' ||
        url.hostname.endsWith('.youtube.com') ||
        url.hostname === 'youtu.be'
    );
}

function isFacebookUrl(url: URL): boolean {
    return (
        url.hostname === 'facebook.com' ||
        url.hostname.endsWith('.facebook.com') ||
        url.hostname === 'fb.watch'
    );
}

// --------------------------------------------------
// CONTROLLER
// --------------------------------------------------

@Controller('api')
export class AppController {
    constructor(private db: PrismaService) {}

    // --------------------------------------------------
    // HEALTH CHECK
    // --------------------------------------------------

    @Get('health')
    health() {
        return { status: 'ok' };
    }

    // --------------------------------------------------
    // ADMIN IMAGE UPLOAD
    // --------------------------------------------------

    @Post('admin/uploads/image')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('image', {
            storage,
            limits: {
                fileSize: MAX_IMAGE_BYTES,
            },
            fileFilter: (_req, file, callback) => {
                const allowedTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/webp',
                    'image/gif',
                ];

                if (!allowedTypes.includes(file.mimetype)) {
                    return callback(
                        new BadRequestException(
                            'Only JPEG, PNG, WebP and GIF images are allowed.',
                        ),
                        false,
                    );
                }

                callback(null, true);
            },
        }),
    )
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException(
                'Please select an image.',
            );
        }

        return {
            imageUrl: `/uploads/${file.filename}`,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
        };
    }

    // --------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------

    @Post('auth/login')
    async login(@Body() body: any) {
        const user = await this.db.adminUser.findUnique({
            where: {
                email: String(body.email || '').toLowerCase(),
            },
        });

        if (
            !user ||
            !user.active ||
            !(await bcrypt.compare(
                String(body.password || ''),
                user.passwordHash,
            ))
        ) {
            throw new UnauthorizedException(
                'Invalid email or password',
            );
        }

        const token = jwt.sign(
            { sub: user.id },
            process.env.JWT_SECRET || '',
            { expiresIn: '12h' },
        );

        return {
            accessToken: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }

    // --------------------------------------------------
    // PUBLIC LANDING PAGE
    // --------------------------------------------------

    @Get('public/landing')
    async publicLanding() {
        const rows = await this.db.landingSection.findMany({
            where: { enabled: true },
            orderBy: { sortOrder: 'asc' },
            select: {
                id: true,
                key: true,
                title: true,
                enabled: true,
                sortOrder: true,
                publishedContent: true,
            },
        });

        return rows.filter(
            (row) => row.publishedContent !== null,
        );
    }

    // --------------------------------------------------
    // PUBLIC VIDEOS
    // --------------------------------------------------

    @Get('public/videos')
    publicVideos() {
        return this.db.video.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: [
                { featured: 'desc' },
                { sortOrder: 'asc' },
                { createdAt: 'desc' },
            ],
        });
    }

    // --------------------------------------------------
    // LANDING PAGE ADMIN
    // --------------------------------------------------

    @Get('admin/sections')
    @UseGuards(AuthGuard)
    async sections() {
        await this.db.landingSection.upsert({
            where: {
                key: 'stats',
            },
            update: {},
            create: {
                key: 'stats',
                title: 'পরিসংখ্যান / Statistics',
                enabled: true,
                sortOrder: 1,
                draftContent: {},
            },
        });

        return this.db.landingSection.findMany({
            orderBy: { sortOrder: 'asc' },
        });
    }

    @Put('admin/sections/:id/draft')
    @UseGuards(AuthGuard)
    async saveDraft(
        @Param('id') id: string,
        @Body() body: any,
    ) {
        if (
            !body.content ||
            typeof body.content !== 'object'
        ) {
            throw new BadRequestException(
                'Content must be a JSON object',
            );
        }

        return this.db.landingSection.update({
            where: { id },
            data: {
                draftContent: body.content,
            },
        });
    }

    @Post('admin/sections/:id/publish')
    @UseGuards(AuthGuard, SuperAdminGuard)
    async publish(@Param('id') id: string) {
        const section = await this.db.landingSection.findUnique({
            where: { id },
        });

        if (!section) {
            throw new NotFoundException(
                'Landing section not found',
            );
        }

        if (section.draftContent === null) {
            throw new BadRequestException(
                'No draft content available to publish',
            );
        }

        return this.db.landingSection.update({
            where: { id },
            data: {
                publishedContent:
                    section.draftContent as Prisma.InputJsonValue,
            },
        });
    }

    @Post('admin/sections/:id/preview')
    @UseGuards(AuthGuard)
    async previewSection(@Param('id') id: string) {
        const section = await this.db.landingSection.findUnique({
            where: { id },
        });

        if (!section) {
            throw new NotFoundException();
        }

        return {
            ...section,
            publishedContent: section.draftContent,
        };
    }

    @Get('admin/preview/landing')
    @UseGuards(AuthGuard)
    async previewLanding() {
        return this.db.landingSection.findMany({
            where: { enabled: true },
            orderBy: { sortOrder: 'asc' },
            select: {
                id: true,
                key: true,
                title: true,
                enabled: true,
                sortOrder: true,
                publishedContent: true,
                draftContent: true,
            },
        });
    }

    // --------------------------------------------------
    // ADMIN VIDEO PREVIEW
    // --------------------------------------------------

    @Get('admin/preview/videos')
    @UseGuards(AuthGuard)
    async previewVideos() {
        return this.db.video.findMany({
            orderBy: [
                { featured: 'desc' },
                { sortOrder: 'asc' },
                { createdAt: 'desc' },
            ],
        });
    }

    // --------------------------------------------------
    // ADMIN VIDEO LIST
    // --------------------------------------------------

    @Get('admin/videos')
    @UseGuards(AuthGuard)
    adminVideos() {
        return this.db.video.findMany({
            orderBy: [{ createdAt: 'desc' }],
        });
    }

    // --------------------------------------------------
    // CREATE VIDEO
    // Supports UPLOAD, YOUTUBE, FACEBOOK, EXTERNAL
    // --------------------------------------------------

    @Post('admin/videos')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'video', maxCount: 1 },
                { name: 'thumbnail', maxCount: 1 },
                { name: 'captions', maxCount: 1 },
            ],
            {
                storage,
                limits: {
                    fileSize: MAX_UPLOAD_BYTES,
                },
                fileFilter: (_req, file, cb) => {
                    if (
                        file.fieldname === 'video' &&
                        !file.mimetype.startsWith('video/')
                    ) {
                        return cb(
                            new BadRequestException(
                                'Video file required.',
                            ),
                            false,
                        );
                    }

                    if (
                        file.fieldname === 'thumbnail' &&
                        !file.mimetype.startsWith('image/')
                    ) {
                        return cb(
                            new BadRequestException(
                                'Image thumbnail required.',
                            ),
                            false,
                        );
                    }

                    if (
                        file.fieldname === 'captions' &&
                        ![
                            'text/vtt',
                            'application/octet-stream',
                        ].includes(file.mimetype)
                    ) {
                        return cb(
                            new BadRequestException(
                                'WebVTT captions file required.',
                            ),
                            false,
                        );
                    }

                    cb(null, true);
                },
            },
        ),
    )
    async createVideo(
        @Body() body: any,
        @UploadedFiles() files: any,
    ) {
        if (!body.titleBn || !body.titleEn) {
            throw new BadRequestException(
                'Bangla and English video titles are required.',
            );
        }

        const allowedSources = [
            'UPLOAD',
            'YOUTUBE',
            'FACEBOOK',
            'EXTERNAL',
        ];

        const source = String(body.source || '');

        if (!allowedSources.includes(source)) {
            throw new BadRequestException(
                'Invalid video source.',
            );
        }

        let mediaUrl = '';
        let durationSeconds: number | null = null;

        const videoFile = files?.video?.[0];

        if (source === 'UPLOAD') {
            if (!videoFile) {
                throw new BadRequestException(
                    'Video file is required.',
                );
            }

            try {
                const duration = await durationOf(
                    videoFile.path,
                );

                if (duration > MAX_VIDEO_DURATION_SECONDS) {
                    throw new BadRequestException(
                        'Uploaded videos must not exceed 5 minutes (300 seconds).',
                    );
                }

                durationSeconds = Math.ceil(duration);
                mediaUrl = `/uploads/${videoFile.filename}`;
            } catch (error) {
                await unlink(videoFile.path).catch(() => {});

                if (error instanceof BadRequestException) {
                    throw error;
                }

                console.error(
                    'Video duration validation failed:',
                    error,
                );

                throw new BadRequestException(
                    'Could not validate the uploaded video duration. Please check that the video is valid and FFprobe is working.',
                );
            }
        } else {
            const inputUrl =
                source === 'YOUTUBE'
                    ? body.youtubeUrl
                    : source === 'FACEBOOK'
                        ? body.facebookUrl
                        : body.externalUrl;

            const url = parseVideoUrl(
                String(inputUrl || ''),
            );

            if (
                source === 'YOUTUBE' &&
                !isYouTubeUrl(url)
            ) {
                throw new BadRequestException(
                    'Please provide a valid YouTube URL.',
                );
            }

            if (
                source === 'FACEBOOK' &&
                !isFacebookUrl(url)
            ) {
                throw new BadRequestException(
                    'Please provide a valid Facebook video URL.',
                );
            }

            mediaUrl = url.toString();
            durationSeconds = null;
        }

        const thumbnail = files?.thumbnail?.[0];
        const captions = files?.captions?.[0];

        try {
            return await this.db.video.create({
                data: {
                    source: source as
                        | 'UPLOAD'
                        | 'YOUTUBE'
                        | 'FACEBOOK'
                        | 'EXTERNAL',

                    titleBn: String(body.titleBn),
                    titleEn: String(body.titleEn),

                    descriptionBn: String(
                        body.descriptionBn || '',
                    ),
                    descriptionEn: String(
                        body.descriptionEn || '',
                    ),

                    categoryBn: String(
                        body.categoryBn || 'স্বাস্থ্য সচেতনতা',
                    ),
                    categoryEn: String(
                        body.categoryEn || 'Health Awareness',
                    ),

                    mediaUrl,

                    thumbnailUrl: thumbnail
                        ? `/uploads/${thumbnail.filename}`
                        : null,

                    captionsUrl: captions
                        ? `/uploads/${captions.filename}`
                        : null,

                    durationSeconds,

                    featured: String(body.featured) === 'true',

                    status: 'DRAFT',
                },
            });
        } catch (error) {
            for (const file of [
                videoFile,
                thumbnail,
                captions,
            ]) {
                if (file?.path) {
                    await unlink(file.path).catch(() => {});
                }
            }

            throw error;
        }
    }

    // --------------------------------------------------
    // UPDATE VIDEO
    // --------------------------------------------------

    @Put('admin/videos/:id')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileFieldsInterceptor(
            [{ name: 'thumbnail', maxCount: 1 }],
            {
                storage,
                limits: {
                    fileSize: MAX_IMAGE_BYTES,
                },
                fileFilter: (_req, file, cb) => {
                    const allowedTypes = [
                        'image/jpeg',
                        'image/png',
                        'image/webp',
                        'image/gif',
                    ];

                    if (!allowedTypes.includes(file.mimetype)) {
                        return cb(
                            new BadRequestException(
                                'Only JPEG, PNG, WebP and GIF images are allowed.',
                            ),
                            false,
                        );
                    }

                    cb(null, true);
                },
            },
        ),
    )
    async updateVideo(
        @Param('id') id: string,
        @Body() body: any,
        @UploadedFiles() files: any,
    ) {
        const existing = await this.db.video.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException(
                'Video not found.',
            );
        }

        const thumbnail = files?.thumbnail?.[0];

        const sortOrder =
            body.sortOrder !== undefined
                ? Number(body.sortOrder)
                : existing.sortOrder;

        if (!Number.isFinite(sortOrder)) {
            if (thumbnail?.path) {
                await unlink(thumbnail.path).catch(() => {});
            }

            throw new BadRequestException(
                'Invalid video sort order.',
            );
        }

        try {
            return await this.db.video.update({
                where: { id },
                data: {
                    titleBn: String(
                        body.titleBn ?? existing.titleBn,
                    ),
                    titleEn: String(
                        body.titleEn ?? existing.titleEn,
                    ),

                    descriptionBn: String(
                        body.descriptionBn ?? existing.descriptionBn,
                    ),
                    descriptionEn: String(
                        body.descriptionEn ?? existing.descriptionEn,
                    ),

                    categoryBn: String(
                        body.categoryBn ?? existing.categoryBn,
                    ),
                    categoryEn: String(
                        body.categoryEn ?? existing.categoryEn,
                    ),

                    featured:
                        body.featured !== undefined
                            ? String(body.featured) === 'true'
                            : existing.featured,

                    sortOrder,

                    ...(thumbnail
                        ? {
                            thumbnailUrl: `/uploads/${thumbnail.filename}`,
                        }
                        : {}),
                },
            });
        } catch (error) {
            if (thumbnail?.path) {
                await unlink(thumbnail.path).catch(() => {});
            }

            throw error;
        }
    }

    // --------------------------------------------------
    // PUBLISH VIDEO
    // SUPER_ADMIN ONLY
    // --------------------------------------------------

    @Post('admin/videos/:id/publish')
    @UseGuards(AuthGuard, SuperAdminGuard)
    async publishVideo(@Param('id') id: string) {
        return this.db.video.update({
            where: { id },
            data: { status: 'PUBLISHED' },
        });
    }

    // --------------------------------------------------
    // UNPUBLISH VIDEO
    // --------------------------------------------------

    @Post('admin/videos/:id/unpublish')
    @UseGuards(AuthGuard)
    async unpublishVideo(@Param('id') id: string) {
        return this.db.video.update({
            where: { id },
            data: { status: 'DRAFT' },
        });
    }

    // --------------------------------------------------
    // DELETE VIDEO
    // --------------------------------------------------

    @Post('admin/videos/:id/delete')
    @UseGuards(AuthGuard)
    async deleteVideo(@Param('id') id: string) {
        return this.db.video.delete({
            where: { id },
        });
    }

    // --------------------------------------------------
    // ADMIN USER MANAGEMENT
    // SUPER_ADMIN ONLY
    // --------------------------------------------------

    @Get('admin/users')
    @UseGuards(AuthGuard, SuperAdminGuard)
    users() {
        return this.db.adminUser.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
                createdAt: true,
            },
        });
    }

    @Post('admin/users')
    @UseGuards(AuthGuard, SuperAdminGuard)
    async createAdmin(@Body() body: any) {
        if (
            !body.name ||
            !body.email ||
            String(body.password || '').length < 12
        ) {
            throw new BadRequestException(
                'Name, email and password (minimum 12 characters) are required',
            );
        }

        const passwordHash = await bcrypt.hash(
            body.password,
            12,
        );

        return this.db.adminUser.create({
            data: {
                name: body.name,
                email: String(body.email).toLowerCase(),
                passwordHash,
                role:
                    body.role === 'SUPER_ADMIN'
                        ? 'SUPER_ADMIN'
                        : 'ADMIN',
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
            },
        });
    }

    // --------------------------------------------------
    // ENABLE / DISABLE LANDING PAGE SECTION
    // --------------------------------------------------

    @Put('admin/sections/:id/enabled')
    @UseGuards(AuthGuard)
    toggleSection(
        @Param('id') id: string,
        @Body() body: any,
    ) {
        return this.db.landingSection.update({
            where: { id },
            data: {
                enabled: Boolean(body.enabled),
            },
        });
    }
}
