import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException, NotFoundException, UnauthorizedException, Query } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';
import { spawn } from 'child_process';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';
import { AuthGuard, SuperAdminGuard, AuthRequest } from './auth';
const uploadDir=process.env.UPLOAD_DIR||'uploads';
const storage=diskStorage({destination:(_req,_file,cb)=>cb(null,uploadDir),filename:(_req,file,cb)=>cb(null,`${randomUUID()}${extname(file.originalname).toLowerCase()}`)});

function durationOf(path: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const bin = require('ffprobe-static').path;

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

        p.stdout.on('data', (data) => {
            out += data;
        });

        p.on('error', reject);

        p.on('close', (code) => {
            const duration = Number(out.trim());

            if (code !== 0 || !Number.isFinite(duration) || duration <= 0) {
                reject(new Error('Could not read video duration.'));
            } else {
                resolve(duration);
            }
        });
    });
}


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
        throw new BadRequestException('A valid video URL is required.');
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

@Controller('api') export class AppController { constructor(private db:PrismaService){}
@Get('health') health(){return {status:'ok'}}

    @Post('admin/uploads/image')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('image', {
            storage,
            limits: {
                fileSize:
                    Number(process.env.MAX_IMAGE_MB || 5) * 1024 * 1024,
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
            throw new BadRequestException('Please select an image.');
        }

        return {
            imageUrl: `/uploads/${file.filename}`,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
        };
    }
    @Post('auth/login') async login(@Body() body:any){const user=await this.db.adminUser.findUnique({where:{email:String(body.email||'').toLowerCase()}});if(!user||!user.active||!await bcrypt.compare(String(body.password||''),user.passwordHash))throw new UnauthorizedException('Invalid email or password');const token=jwt.sign({sub:user.id},process.env.JWT_SECRET||'',{expiresIn:'12h'});return {accessToken:token,user:{id:user.id,name:user.name,email:user.email,role:user.role}}}
@Get('public/landing') async publicLanding(){const rows=await this.db.landingSection.findMany({where:{enabled:true},orderBy:{sortOrder:'asc'},select:{id:true,key:true,title:true,enabled:true,sortOrder:true,publishedContent:true}});return rows.filter(r=>r.publishedContent!==null)}
@Get('public/videos') publicVideos(){return this.db.video.findMany({where:{status:'PUBLISHED'},orderBy:[{featured:'desc'},{sortOrder:'asc'},{createdAt:'desc'}]})}
@Get('admin/sections') @UseGuards(AuthGuard) sections(){return this.db.landingSection.findMany({orderBy:{sortOrder:'asc'}})}
@Put('admin/sections/:id/draft') @UseGuards(AuthGuard) async saveDraft(@Param('id') id:string,@Body() body:any){if(!body.content||typeof body.content!=='object')throw new BadRequestException('Content must be a JSON object');return this.db.landingSection.update({where:{id},data:{draftContent:body.content}})}

    @Post('admin/sections/:id/publish')
    @UseGuards(AuthGuard, SuperAdminGuard)
    async publish(@Param('id') id: string) {
        const section = await this.db.landingSection.findUnique({
            where: { id },
        });

        if (!section) {
            throw new NotFoundException('Landing section not found');
        }

        if (section.draftContent === null) {
            throw new BadRequestException('No draft content available to publish');
        }

        return this.db.landingSection.update({
            where: { id },
            data: {
                publishedContent: section.draftContent as Prisma.InputJsonValue,
            },
        });
    }

    @Post('admin/sections/:id/preview') @UseGuards(AuthGuard) async previewSection(@Param('id') id:string){const s=await this.db.landingSection.findUnique({where:{id}});if(!s)throw new NotFoundException();return {...s,publishedContent:s.draftContent}}
@Get('admin/preview/landing') @UseGuards(AuthGuard) async previewLanding(){return this.db.landingSection.findMany({where:{enabled:true},orderBy:{sortOrder:'asc'},select:{id:true,key:true,title:true,enabled:true,sortOrder:true,publishedContent:true,draftContent:true}})}
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
    @Get('admin/videos') @UseGuards(AuthGuard) adminVideos(){return this.db.video.findMany({orderBy:[{createdAt:'desc'}]})}

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
                limits: process.env.MAX_UPLOAD_MB
                    ? {
                        fileSize:
                            Number(process.env.MAX_UPLOAD_MB) * 1024 * 1024,
                    }
                    : {},
                fileFilter: (_req, file, cb) => {
                    if (
                        file.fieldname === 'video' &&
                        !process.env.MAX_UPLOAD_MB
                    ) {
                        return cb(
                            new Error('Video uploads are not configured.'),
                            false,
                        );
                    }

                    if (
                        file.fieldname === 'video' &&
                        !file.mimetype.startsWith('video/')
                    ) {
                        return cb(new Error('Video file required.'), false);
                    }

                    if (
                        file.fieldname === 'thumbnail' &&
                        !file.mimetype.startsWith('image/')
                    ) {
                        return cb(new Error('Image thumbnail required.'), false);
                    }

                    if (
                        file.fieldname === 'captions' &&
                        !['text/vtt', 'application/octet-stream'].includes(
                            file.mimetype,
                        )
                    ) {
                        return cb(new Error('WebVTT captions file required.'), false);
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
            throw new BadRequestException('Invalid video source.');
        }

        let mediaUrl = '';
        let durationSeconds: number | null = null;

        const videoFile = files?.video?.[0];

        if (source === 'UPLOAD') {
            if (
                !process.env.MAX_UPLOAD_MB ||
                !Number.isFinite(Number(process.env.MAX_UPLOAD_MB)) ||
                Number(process.env.MAX_UPLOAD_MB) <= 0
            ) {
                throw new BadRequestException(
                    'Video uploads are not configured.',
                );
            }

            if (!videoFile) {
                throw new BadRequestException('Video file is required.');
            }

            try {
                const duration = await durationOf(videoFile.path);

                if (duration > 180) {
                    throw new BadRequestException(
                        'Uploaded videos must not exceed 180 seconds.',
                    );
                }

                durationSeconds = Math.ceil(duration);
                mediaUrl = `/uploads/${videoFile.filename}`;
            } catch (error) {
                await unlink(videoFile.path).catch(() => {});

                if (error instanceof BadRequestException) {
                    throw error;
                }

                throw new BadRequestException(
                    'Could not validate the uploaded video duration.',
                );
            }
        } else {
            const inputUrl =
                source === 'YOUTUBE'
                    ? body.youtubeUrl
                    : source === 'FACEBOOK'
                        ? body.facebookUrl
                        : body.externalUrl;

            const url = parseVideoUrl(String(inputUrl || ''));

            if (source === 'YOUTUBE' && !isYouTubeUrl(url)) {
                throw new BadRequestException(
                    'Please provide a valid YouTube URL.',
                );
            }

            if (source === 'FACEBOOK' && !isFacebookUrl(url)) {
                throw new BadRequestException(
                    'Please provide a valid Facebook video URL.',
                );
            }

            mediaUrl = url.toString();

            // External videos have no locally enforced duration limit.
            durationSeconds = null;
        }

        const thumbnail = files?.thumbnail?.[0];
        const captions = files?.captions?.[0];

        return this.db.video.create({
            data: {
                source: source as
                    | 'UPLOAD'
                    | 'YOUTUBE'
                    | 'FACEBOOK'
                    | 'EXTERNAL',

                titleBn: String(body.titleBn),
                titleEn: String(body.titleEn),

                descriptionBn: String(body.descriptionBn || ''),
                descriptionEn: String(body.descriptionEn || ''),

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
    }

    // if(duration>180){if(source==='UPLOAD'&&files?.video?.[0]?.path)await unlink(files.video[0].path).catch(()=>{});throw new BadRequestException('Maximum video duration is 180 seconds (3 minutes)');}if(duration<1)throw new BadRequestException('Invalid video duration');const thumb=files?.thumbnail?.[0];const captions=files?.captions?.[0];return this.db.video.create({data:{source,titleBn:String(body.titleBn||''),titleEn:String(body.titleEn||''),descriptionBn:String(body.descriptionBn||''),descriptionEn:String(body.descriptionEn||''),categoryBn:String(body.categoryBn||'স্বাস্থ্য সচেতনতা'),categoryEn:String(body.categoryEn||'Health Awareness'),mediaUrl,thumbnailUrl:thumb?`/uploads/${thumb.filename}`:null,captionsUrl:captions?`/uploads/${captions.filename}`:null,durationSeconds:duration,featured:String(body.featured)==='true',status:'DRAFT'}})}
@Put('admin/videos/:id') @UseGuards(AuthGuard) async updateVideo(@Param('id') id:string,@Body() b:any){return this.db.video.update({where:{id},data:{titleBn:String(b.titleBn||''),titleEn:String(b.titleEn||''),descriptionBn:String(b.descriptionBn||''),descriptionEn:String(b.descriptionEn||''),categoryBn:String(b.categoryBn||''),categoryEn:String(b.categoryEn||''),featured:Boolean(b.featured),sortOrder:Number(b.sortOrder||0)}})}
    @Post('admin/videos/:id/publish') @UseGuards(AuthGuard, SuperAdminGuard) async publishVideo(@Param('id') id:string){return this.db.video.update({where:{id},data:{status:'PUBLISHED'}})}
@Post('admin/videos/:id/unpublish') @UseGuards(AuthGuard) async unpublishVideo(@Param('id') id:string){return this.db.video.update({where:{id},data:{status:'DRAFT'}})}
@Post('admin/videos/:id/delete') @UseGuards(AuthGuard) async deleteVideo(@Param('id') id:string){return this.db.video.delete({where:{id}})}
@Get('admin/users') @UseGuards(AuthGuard,SuperAdminGuard) users(){return this.db.adminUser.findMany({select:{id:true,name:true,email:true,role:true,active:true,createdAt:true}})}
@Post('admin/users') @UseGuards(AuthGuard,SuperAdminGuard) async createAdmin(@Body() b:any){if(!b.name||!b.email||String(b.password||'').length<12)throw new BadRequestException('Name, email and password (minimum 12 characters) are required');const passwordHash=await bcrypt.hash(b.password,12);return this.db.adminUser.create({data:{name:b.name,email:String(b.email).toLowerCase(),passwordHash,role:b.role==='SUPER_ADMIN'?'SUPER_ADMIN':'ADMIN'},select:{id:true,name:true,email:true,role:true,active:true}})}
@Put('admin/sections/:id/enabled') @UseGuards(AuthGuard) toggleSection(@Param('id') id:string,@Body() b:any){return this.db.landingSection.update({where:{id},data:{enabled:Boolean(b.enabled)}})}
}
