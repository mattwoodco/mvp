# Video Management System Implementation

## Overview

I've created a comprehensive video management system that allows users to create projects, upload large video files, transcode them for optimal web playback, and view them in a built-in player. The system includes proper loading states, error handling, and a clean user interface.

## Database Schema

### New Tables Created

1. **`project`** - Stores video projects
   - `id` (UUID, primary key)
   - `name` (text, required)
   - `description` (text, optional)
   - `ownerId` (references user.id)
   - `createdAt`, `updatedAt` (timestamps)

2. **`project_member`** - Junction table for project membership
   - `id` (UUID, primary key)
   - `projectId` (references project.id, cascade delete)
   - `userId` (references user.id, cascade delete)
   - `role` (enum: owner, admin, member)
   - `createdAt` (timestamp)

3. **`video`** - Stores video files and metadata
   - `id` (UUID, primary key)
   - `projectId` (references project.id, cascade delete)
   - `title`, `description` (text)
   - `originalUrl`, `transcodedUrl`, `thumbnailUrl` (text)
   - `duration`, `fileSize` (text)
   - `status` (enum: uploading, processing, ready, error)
   - `errorMessage` (text)
   - `uploadedBy` (references user.id)
   - `createdAt`, `updatedAt` (timestamps)

## CRUD Operations

### Database Queries (`packages/database/src/lib/queries.ts`)
- `getProjectById(id)` - Get project details
- `getProjectsByUserId(userId)` - Get all projects for a user with role
- `getProjectMembers(projectId)` - Get project members with user details
- `getVideoById(id)` - Get video details with uploader name
- `getVideosByProjectId(projectId)` - Get all videos in a project

### Database Mutations (`packages/database/src/lib/mutations.ts`)
- `createProject(data)` - Create project and add owner as member
- `updateProject(id, data)` - Update project details
- `deleteProject(id)` - Delete project (cascades to members and videos)
- `addProjectMember(data)` - Add user to project
- `removeProjectMember(projectId, userId)` - Remove user from project
- `createVideo(data)` - Create video record
- `updateVideo(id, data)` - Update video metadata and status
- `deleteVideo(id)` - Delete video record

## Frontend Implementation

### Project Management Pages

1. **Projects List** (`/projects`)
   - Displays all user's projects with role badges
   - Create new project button
   - Empty state with call-to-action

2. **Individual Project** (`/projects/[id]`)
   - Project details and member info
   - Video grid with status indicators
   - Add video button
   - Thumbnail previews and play buttons for ready videos

3. **New Project** (`/projects/new`)
   - Form for creating new projects
   - Name and description fields
   - Proper validation and loading states

### Video Upload System

1. **Video Upload Form** (`/projects/[id]/videos/new`)
   - **Large File Uploader Integration**: Uses the existing `@mvp/ui/large-file-uploader` component
   - **File Validation**: Accepts video formats (MP4, WebM, QuickTime) up to 2GB
   - **Chunked Upload**: Supports large file upload with progress tracking
   - **Real-time Status Updates**: Shows upload, processing, and completion states
   - **Error Handling**: Displays errors with retry options

2. **Video Processing Workflow**:
   1. User fills in video details (title, description)
   2. File is uploaded using large file uploader with progress
   3. Video record is created in database
   4. File is sent to transcoder service for optimization
   5. Status updates in real-time (uploading → processing → ready)
   6. Video preview becomes available when ready

3. **Video Player** (`/projects/[id]/videos/[videoId]`)
   - HTML5 video player with controls
   - Video metadata display
   - Responsive layout with video details sidebar
   - Status indicators for processing videos

## Server Actions

### Project Actions (`/projects/new/actions.ts`)
- `createProjectAction(data)` - Server action for creating projects

### Video Actions (`/projects/[id]/videos/new/actions.ts`)
- `createVideoAction(data)` - Create video record
- `transcodeVideoAction(videoId, originalUrl)` - Send video to transcoder service

## Integration Points

### Storage Integration
- Uses existing `@mvp/storage` package for file uploads
- Leverages `uploadLargeFile` function for chunked uploads
- Handles both local (MinIO) and production (Vercel Blob) storage

### Transcoder Integration
- Connects to the existing `@mvp/transcoder` service
- Sends video files for H.264 optimization
- Receives transcoded URLs for web-optimized playback
- Handles transcoding errors gracefully

### Authentication
- Uses existing `@mvp/auth` system
- Server-side session validation
- User-specific project access control

## Loading States and Error Handling

### Upload States
- **Idle**: Form ready for input
- **Uploading**: Progress bar and status updates
- **Uploaded**: Confirmation and transition to processing
- **Processing**: Transcoding in progress indicator
- **Ready**: Video preview and success state
- **Error**: Error message with retry option

### Error Scenarios Handled
- File upload failures
- Transcoding service errors
- Network connectivity issues
- Invalid file formats or sizes
- Database operation failures

## User Experience Features

1. **Progressive Disclosure**: Form fields → Upload → Processing → Player
2. **Visual Feedback**: Status badges, progress bars, loading spinners
3. **Responsive Design**: Works on desktop and mobile
4. **Accessibility**: Proper form labels, keyboard navigation
5. **Performance**: Lazy loading, optimized queries

## Technical Features

1. **TypeScript**: Full type safety throughout
2. **Server Components**: Fast initial page loads
3. **Client Components**: Interactive forms and upload progress
4. **Database Transactions**: Consistent data operations
5. **Revalidation**: Cache invalidation on data changes
6. **Migration**: Database schema versioning with Drizzle

## File Structure

```
apps/website/src/app/
├── projects/
│   ├── page.tsx                    # Projects list
│   ├── new/
│   │   ├── page.tsx               # New project page
│   │   ├── new-project-form.tsx   # Project creation form
│   │   └── actions.ts             # Project server actions
│   └── [id]/
│       ├── page.tsx               # Individual project
│       └── videos/
│           ├── new/
│           │   ├── page.tsx       # Video upload page
│           │   ├── video-upload-form.tsx  # Upload form component
│           │   └── actions.ts     # Video server actions
│           └── [videoId]/
│               └── page.tsx       # Video player page

packages/database/src/
├── schema/
│   └── projects.schema.ts         # New database schema
├── lib/
│   ├── queries.ts                 # Extended with video/project queries
│   └── mutations.ts               # Extended with video/project mutations
└── drizzle/
    └── 0000_typical_harpoon.sql   # Generated migration
```

## Next Steps

1. **Run Migration**: Execute the generated SQL migration to create the new tables
2. **Environment Setup**: Ensure `TRANSCODER_URL` environment variable is set
3. **Testing**: Test the complete upload → transcode → play workflow
4. **Permissions**: Add project member management UI
5. **Optimization**: Add video thumbnail generation
6. **Analytics**: Track upload and playback metrics

## Key Benefits

1. **Scalable Architecture**: Microservices approach with separate transcoder
2. **User-Friendly**: Comprehensive loading states and error handling
3. **Performance**: Chunked uploads for large files, optimized video delivery
4. **Maintainable**: Clean separation of concerns, TypeScript safety
5. **Extensible**: Easy to add features like video editing, comments, sharing

The implementation provides a complete video management solution that handles the entire lifecycle from upload to playback, with proper user feedback and error handling throughout the process.