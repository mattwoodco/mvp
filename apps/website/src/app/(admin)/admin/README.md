# Admin Dashboard

A comprehensive admin dashboard for monitoring users, listings, and system activity.

## Features

### 1. **Dashboard Overview**
- Real-time statistics showing:
  - Total users (with verified count)
  - Total listings (with active count)
  - Admin users count
  - Recent activity logs

### 2. **User Management**
- View all registered users
- Filter and search users by name/email
- See user verification status
- View assigned admin roles
- Actions:
  - Copy user ID
  - View user details
  - Assign/modify roles
  - Suspend users

### 3. **Listings Management**
- Monitor all listings in the system
- View listing details with owner information
- Check listing status (active/inactive)
- Sort by price, date created
- Actions:
  - View listing details
  - Edit listings
  - Activate/deactivate listings
  - Delete listings

### 4. **Data Export Features**
All tables support:
- **CSV Export** - Export filtered data to CSV format
- **Excel Export** - Export to XLSX format with formatting
- **PDF Export** - Generate PDF reports with table formatting
- **Column Selection** - Choose which columns to display/export
- **Search & Filter** - Filter data before export
- **Pagination** - Navigate through large datasets

## Database Schema

### Admin Roles
```typescript
adminRole {
  id: string
  name: "super_admin" | "admin" | "moderator" | "viewer"
  description: string
  permissions: JSON
  createdAt: timestamp
  updatedAt: timestamp
}
```

### User Admin Roles
```typescript
userAdminRole {
  id: string
  userId: string (references user)
  roleId: string (references adminRole)
  assignedBy: string (references user)
  assignedAt: timestamp
  isActive: boolean
}
```

### Admin Activity Logs
```typescript
adminActivityLog {
  id: string
  userId: string (references user)
  action: string
  entityType: string
  entityId: string
  metadata: JSON
  ipAddress: string
  userAgent: string
  createdAt: timestamp
}
```

## API Endpoints

### Users Management
- `GET /api/admin/users` - Fetch users with filters
  - Query params: `page`, `pageSize`, `search`, `emailVerified`, `createdFrom`, `createdTo`, `hasRole`

### Listings Management
- `GET /api/admin/listings` - Fetch listings with filters
  - Query params: `page`, `pageSize`, `search`, `isActive`, `priceMin`, `priceMax`, `userId`, `createdFrom`, `createdTo`

### Dashboard Stats
- `GET /api/admin/stats` - Get dashboard statistics

## Usage

1. Navigate to `/admin` to access the dashboard
2. Use tabs to switch between different views
3. Use search and filters to find specific data
4. Export data using the Export dropdown menu
5. Customize visible columns using the Columns dropdown

## Security Considerations

- Implement authentication middleware to protect admin routes
- Add role-based access control (RBAC) for different admin levels
- Log all admin actions for audit trail
- Validate all inputs and sanitize data
- Use HTTPS for all admin communications

## Future Enhancements

- Real-time updates using WebSockets
- Advanced analytics and charts
- Bulk operations (bulk delete, bulk status update)
- Email notifications for critical events
- Custom report builder
- API rate limiting for admin endpoints