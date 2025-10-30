# Campus Pulse API Test Report

## Test Summary
- **Execution Date:** 2025-10-30T17:00:02.477Z
- **Execution Time:** 0.10 seconds
- **Total Tests:** 42
- **Passed:** 1
- **Failed:** 41
- **Success Rate:** 2.4%

## Test Categories
- **Authentication:** 4 tests
- **User Management:** 8 tests
- **Event Management:** 9 tests
- **Notifications:** 4 tests
- **Feedback:** 3 tests
- **Blog Management:** 3 tests
- **Admin Management:** 6 tests
- **Analytics:** 2 tests
- **Metadata:** 2 tests
- **System:** 1 tests
- **Upload:** 0 tests

## Detailed Results
### authAPI.login
- **Category:** Authentication
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### authAPI.register
- **Category:** Authentication
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### authAPI.forgotPassword
- **Category:** Authentication
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### authAPI.logout
- **Category:** Authentication
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### userAPI.getProfile
- **Category:** User Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### userAPI.updateProfile
- **Category:** User Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### userAPI.uploadAvatar
- **Category:** User Management
- **Status:** PASS
- **Message:** Success

- **Response Time:** N/A

### userAPI.getUserById
- **Category:** User Management
- **Status:** FAIL
- **Message:** No test user ID available



### userAPI.getAllUsers
- **Category:** User Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### userAPI.updateUser
- **Category:** User Management
- **Status:** FAIL
- **Message:** No test user ID available



### userAPI.changePassword
- **Category:** User Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### userAPI.updateUserRole
- **Category:** User Management
- **Status:** FAIL
- **Message:** No test user ID available



### eventAPI.getAll
- **Category:** Event Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### eventAPI.getUpcoming
- **Category:** Event Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### eventAPI.getPresent
- **Category:** Event Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### eventAPI.getPast
- **Category:** Event Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### eventAPI.create
- **Category:** Event Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### eventAPI.getUserRegistered
- **Category:** Event Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### eventAPI.getUserCreated
- **Category:** Event Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### eventAPI.getEventsByCategory
- **Category:** Event Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### eventAPI.searchEvents
- **Category:** Event Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### notificationAPI.create
- **Category:** Notifications
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### notificationAPI.getUserNotifications
- **Category:** Notifications
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### notificationAPI.getUnreadCount
- **Category:** Notifications
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### notificationAPI.markAllAsRead
- **Category:** Notifications
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### feedbackAPI.create
- **Category:** Feedback
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### feedbackAPI.getUserFeedback
- **Category:** Feedback
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### feedbackAPI.getAll
- **Category:** Feedback
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### blogAPI.getAll
- **Category:** Blog Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### blogAPI.create
- **Category:** Blog Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### blogAPI.getUserBlogs
- **Category:** Blog Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### adminAPI.getDashboard
- **Category:** Admin Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### adminAPI.getAuditLog
- **Category:** Admin Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### adminAPI.getPendingEvents
- **Category:** Admin Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### adminAPI.getAllUsers
- **Category:** Admin Management
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### adminAPI.updateUserRole
- **Category:** Admin Management
- **Status:** FAIL
- **Message:** Failed to create test user for role update



### adminAPI.updateUserStatus
- **Category:** Admin Management
- **Status:** FAIL
- **Message:** Failed to create test user for status update



### analyticsAPI.getDashboard
- **Category:** Analytics
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### analyticsAPI.getFeedback
- **Category:** Analytics
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### metadataAPI.getDepartments
- **Category:** Metadata
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### metadataAPI.getYears
- **Category:** Metadata
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000



### healthCheck
- **Category:** System
- **Status:** FAIL
- **Message:** connect ECONNREFUSED 127.0.0.1:5000




## Recommendations
- Review failed API endpoints and fix backend implementations
- Check authentication middleware for protected routes
- Verify database connections and data models
- Update frontend error handling for failed endpoints
- Implement missing API routes identified in the analysis

## Notes
This test suite is based on the Frontend_API_Usage_Analysis.md and covers all identified API endpoints used by the Campus Pulse frontend application.
