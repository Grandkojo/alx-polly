# ALX Polly: A Secure Polling Application

Welcome to ALX Polly, a full-stack polling application built with Next.js, TypeScript, and Supabase. This project serves as a practical learning ground for modern web development concepts, with a special focus on identifying and fixing common security vulnerabilities.

## 🚀 Project Overview

ALX Polly is a comprehensive polling platform that enables users to create, share, and vote on polls with robust security measures. The application demonstrates modern web development best practices while providing a real-world example of security vulnerability identification and remediation.

### ✨ Key Features

- **🔐 Secure Authentication**: User registration, login, and session management
- **📊 Poll Management**: Create, edit, delete, and manage polls with ownership verification
- **🗳️ Voting System**: Cast votes with duplicate prevention and validation
- **👤 User Dashboard**: Personalized interface for poll management
- **🛡️ Admin Panel**: Administrative interface with role-based access control
- **📱 Responsive Design**: Mobile-first design with modern UI components

### 🏗️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | [Next.js 15.4.1](https://nextjs.org/) | Full-stack React framework with App Router |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Type-safe JavaScript development |
| **Backend** | [Supabase](https://supabase.io/) | Backend-as-a-Service with PostgreSQL |
| **Authentication** | Supabase Auth | Secure user authentication and session management |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS framework |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) | Accessible component library |
| **State Management** | React Server Components | Server-side state management |
| **Validation** | Custom validation utilities | Input sanitization and validation |

### 🏛️ Architecture

The application follows Next.js App Router architecture with clear separation of concerns:

```
alx-polly/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (dashboard)/              # Protected dashboard routes
│   ├── lib/                      # Server actions and utilities
│   └── components/               # Reusable UI components
├── lib/                          # Shared utilities and configurations
│   ├── supabase/                 # Supabase client configurations
│   └── validation.ts             # Input validation utilities
└── components/ui/                # shadcn/ui components
```

## 🛠️ Setup Instructions

### Prerequisites

Before setting up the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/) for version control
- A [Supabase](https://supabase.io/) account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd alx-polly
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Supabase Configuration

#### Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Choose your organization and enter project details:
   - **Name**: `alx-polly` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
4. Click "Create new project"

#### Database Schema Setup

Once your Supabase project is ready, run the following SQL commands in the Supabase SQL Editor:

```sql
-- Create polls table
CREATE TABLE polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for polls
CREATE POLICY "Users can view all polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Users can create polls" ON polls FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own polls" ON polls FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own polls" ON polls FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for votes
CREATE POLICY "Users can view all votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Users can create votes" ON votes FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_polls_user_id ON polls(user_id);
CREATE INDEX idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
```

### 4. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To get these values:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and **anon public** key
4. Paste them into your `.env.local` file

Example `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## 📖 Usage Examples

### Creating a Poll

1. **Register/Login**: Create an account or sign in
2. **Navigate to Create**: Click "Create Poll" in the dashboard
3. **Enter Poll Details**:
   - **Question**: "What's your favorite programming language?"
   - **Options**: 
     - "JavaScript"
     - "Python"
     - "Java"
     - "TypeScript"
4. **Submit**: Click "Create Poll" to save

### Voting on a Poll

1. **Access Poll**: Click on any poll from the dashboard or use a direct link
2. **Select Option**: Choose your preferred option
3. **Submit Vote**: Click "Submit Vote"
4. **Confirmation**: See success message confirming your vote

### Managing Your Polls

1. **View Polls**: Access your polls from the dashboard
2. **Edit Poll**: Click "Edit" to modify poll content
3. **Delete Poll**: Click "Delete" with confirmation
4. **View Results**: Check poll results and vote counts

### Admin Features

1. **Admin Access**: Navigate to `/admin` (requires admin email)
2. **View All Polls**: See all polls in the system
3. **Manage Polls**: Delete any poll as an administrator
4. **Monitor System**: View poll statistics and user activity

## 🧪 Testing the Application

### Local Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test Authentication**:
   - Register a new account
   - Login with existing credentials
   - Test logout functionality

3. **Test Poll Creation**:
   - Create polls with various question types
   - Test option limits (2-10 options)
   - Verify input validation

4. **Test Voting**:
   - Vote on polls as authenticated user
   - Test anonymous voting
   - Verify duplicate vote prevention

5. **Test Security Features**:
   - Try accessing admin panel without admin privileges
   - Attempt to delete polls you don't own
   - Test input validation with malicious content

### Security Testing

The application includes several security features to test:

- **Authorization**: Verify users can only modify their own polls
- **Input Validation**: Test XSS prevention and input sanitization
- **Authentication**: Test session management and logout
- **Admin Access**: Verify role-based access control

### Performance Testing

- **Database Queries**: Monitor Supabase dashboard for query performance
- **Page Load Times**: Test with various poll counts
- **Concurrent Users**: Test with multiple browser sessions

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run tsc          # Run TypeScript compiler

# Database (if using Supabase CLI)
supabase start       # Start local Supabase
supabase db reset    # Reset local database
supabase gen types   # Generate TypeScript types
```

## 📁 Project Structure

```
alx-polly/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── admin/               # Admin panel
│   │   ├── create/              # Poll creation
│   │   └── polls/               # Poll management
│   ├── lib/                     # Server actions and utilities
│   │   ├── actions/             # Server actions
│   │   ├── context/             # React contexts
│   │   └── types/               # TypeScript types
│   └── components/               # Reusable components
├── lib/                          # Shared utilities
│   ├── supabase/                # Supabase configurations
│   └── validation.ts            # Input validation
├── components/ui/               # shadcn/ui components
└── public/                      # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review the security audit documentation below
3. Ensure all environment variables are properly set
4. Verify Supabase configuration and database schema

---

## 🔒 Security Audit Report: Vulnerabilities Discovered & Remediated

This document provides a comprehensive overview of the security vulnerabilities that were identified in the ALX Polly application and the remediation measures implemented to address them.

### 🚨 Critical Vulnerabilities Identified & Fixed

#### 1. **Authorization Bypass in Poll Deletion** - CRITICAL ✅ FIXED

**Vulnerability Description:**
- **Location**: `app/lib/actions/poll-actions.ts:99-105`
- **Issue**: The `deletePoll` function lacked proper authorization checks
- **Impact**: Any authenticated user could delete ANY poll in the system, regardless of ownership

**Before (Vulnerable Code):**
```typescript
export async function deletePoll(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("polls").delete().eq("id", id);
  // ❌ NO USER AUTHENTICATION CHECK
  // ❌ NO OWNERSHIP VERIFICATION
}
```

**After (Secure Implementation):**
```typescript
export async function deletePoll(id: string) {
  const supabase = await createClient();
  
  // Get user from session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "You must be logged in to delete a poll." };
  }

  // Only allow deleting polls owned by the user
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
}
```

**Remediation Steps:**
1. Added user authentication verification
2. Implemented ownership-based authorization
3. Added proper error handling for unauthorized access

---

#### 2. **Admin Panel Access Control Missing** - CRITICAL ✅ FIXED

**Vulnerability Description:**
- **Location**: `app/(dashboard)/admin/page.tsx`
- **Issue**: No role-based access control for admin functionality
- **Impact**: Any authenticated user could access admin features and view/delete all polls

**Before (Vulnerable Code):**
```typescript
// Client-side data fetching without authorization
const { data, error } = await supabase
  .from("polls")
  .select("*")  // ❌ Fetches ALL polls without server-side authorization
  .order("created_at", { ascending: false });
```

**After (Secure Implementation):**
- Created `app/lib/actions/admin-actions.ts` with server-side authorization
- Implemented email-based admin verification
- Converted admin page to server-side rendering with proper access control

**Remediation Steps:**
1. Created dedicated admin actions with authorization checks
2. Implemented server-side admin verification
3. Added proper error handling for unauthorized access
4. Converted client-side data fetching to server-side operations

---

#### 3. **Vote Manipulation Vulnerability** - HIGH ✅ FIXED

**Vulnerability Description:**
- **Location**: `app/lib/actions/poll-actions.ts:77-96`
- **Issue**: No duplicate vote prevention, no input validation, no rate limiting
- **Impact**: Users could vote multiple times, vote for non-existent options, or perform vote flooding

**Before (Vulnerable Code):**
```typescript
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  // ❌ No duplicate vote prevention
  // ❌ No rate limiting
  // ❌ Option index not validated against poll options
}
```

**After (Secure Implementation):**
```typescript
export async function submitVote(pollId: string, optionIndex: number) {
  // Validate poll ID and option index
  const pollIdValidation = validatePollId(pollId);
  if (!pollIdValidation.isValid) {
    return { error: pollIdValidation.error };
  }

  // Get the poll to validate option index
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("options")
    .eq("id", pollId)
    .single();

  // Validate option index is within bounds
  const optionIndexValidation = validateOptionIndex(optionIndex, poll.options.length);
  
  // Check for existing vote if user is logged in
  if (user) {
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .single();

    if (existingVote) {
      return { error: "You have already voted on this poll." };
    }
  }
}
```

**Remediation Steps:**
1. Added comprehensive input validation
2. Implemented duplicate vote prevention for authenticated users
3. Added poll existence verification
4. Implemented option index validation against poll options
5. Added proper error handling and user feedback

---

#### 4. **Input Validation & Sanitization Missing** - MEDIUM ✅ FIXED

**Vulnerability Description:**
- **Location**: Multiple locations throughout the application
- **Issue**: No length limits, no sanitization, no protection against XSS
- **Impact**: Potential XSS attacks, data corruption, system abuse

**Before (Vulnerable Code):**
```typescript
// No input validation or sanitization
const question = formData.get("question") as string;
const options = formData.getAll("options").filter(Boolean) as string[];
```

**After (Secure Implementation):**
- Created comprehensive validation system (`lib/validation.ts`)
- Implemented XSS protection with input sanitization
- Added length limits and content validation

**New Validation System:**
```typescript
// lib/validation.ts
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

export function validatePollQuestion(question: string): { isValid: boolean; error?: string } {
  if (!question || typeof question !== 'string') {
    return { isValid: false, error: 'Question is required.' };
  }
  
  const sanitized = sanitizeString(question);
  
  if (sanitized.length < 3) {
    return { isValid: false, error: 'Question must be at least 3 characters long.' };
  }
  
  if (sanitized.length > 500) {
    return { isValid: false, error: 'Question must be less than 500 characters.' };
  }
  
  return { isValid: true };
}
```

**Remediation Steps:**
1. Created comprehensive input validation utilities
2. Implemented XSS protection with input sanitization
3. Added length limits: questions (3-500 chars), options (1-200 chars)
4. Implemented duplicate option prevention
5. Added UUID validation for poll IDs
6. Applied validation to all user input points

---

#### 5. **Information Disclosure** - MEDIUM ✅ FIXED

**Vulnerability Description:**
- **Location**: `app/(dashboard)/admin/page.tsx:80-90`
- **Issue**: Exposed internal user IDs and poll IDs
- **Impact**: Could aid in enumeration attacks and information gathering

**Before (Vulnerable Code):**
```typescript
// Exposed sensitive internal data
<div>
  Poll ID: <code>{poll.id}</code>
</div>
<div>
  Owner ID: <code>{poll.user_id}</code>
</div>
```

**After (Secure Implementation):**
- Limited information exposure
- Implemented proper error handling without information disclosure
- Added data sanitization for displayed information

**Remediation Steps:**
1. Limited exposure of internal IDs
2. Implemented proper error handling
3. Added data sanitization for user-facing information
4. Removed unnecessary technical details from user interface

---

### 🛡️ Additional Security Improvements Implemented

#### **Server-Side Data Fetching**
- Converted admin page from client-side to server-side data fetching
- Eliminated reliance on client-side security measures
- Implemented proper server-side authorization checks

#### **Authentication Flow Optimization**
- Fixed infinite loading session issues
- Improved auth context management
- Enhanced middleware authentication handling

#### **Error Handling Enhancement**
- Added comprehensive error handling throughout the application
- Implemented proper error messages without information disclosure
- Added user-friendly error feedback

#### **Code Structure Improvements**
- Created dedicated admin actions (`admin-actions.ts`)
- Implemented modular validation system (`validation.ts`)
- Enhanced separation of concerns between client and server components

---

### 📋 Files Modified/Created During Security Remediation

**New Security Files:**
- `lib/validation.ts` - Input validation and sanitization utilities
- `app/lib/actions/admin-actions.ts` - Secure admin operations with authorization
- `app/(dashboard)/admin/AdminPollActions.tsx` - Secure admin poll management component
- `app/(dashboard)/polls/[id]/PollVotingForm.tsx` - Secure voting component with validation

**Modified Files:**
- `app/lib/actions/poll-actions.ts` - Added comprehensive security measures
- `app/(dashboard)/admin/page.tsx` - Converted to server-side with proper authorization
- `app/(dashboard)/polls/[id]/page.tsx` - Updated to use real data with security measures
- `lib/supabase/middleware.ts` - Enhanced authentication handling
- `app/lib/context/auth-context.tsx` - Fixed infinite loading session issues

---

### 🔐 Security Best Practices Implemented

1. **Principle of Least Privilege**: Users can only access/modify their own data
2. **Input Validation**: All inputs are validated and sanitized before processing
3. **Authentication Required**: All sensitive operations require proper authentication
4. **Server-Side Validation**: Critical operations happen server-side to prevent bypass
5. **Error Handling**: Proper error messages without information disclosure
6. **Rate Limiting Ready**: Structure in place for implementing rate limiting
7. **XSS Protection**: Input sanitization prevents cross-site scripting attacks
8. **Authorization Checks**: Every sensitive operation verifies user permissions

---

### 🎯 Security Audit Methodology

The security audit followed industry best practices:

1. **Static Code Analysis**: Reviewed all source code for security vulnerabilities
2. **Authentication Flow Review**: Analyzed user authentication and session management
3. **Authorization Testing**: Verified access controls and permission systems
4. **Input Validation Assessment**: Checked for injection vulnerabilities and XSS
5. **Business Logic Review**: Analyzed application logic for security flaws
6. **Data Access Pattern Analysis**: Reviewed database interactions and data exposure

---

### 🚀 Next Steps for Enhanced Security

While the critical vulnerabilities have been addressed, consider implementing these additional security measures:

1. **Rate Limiting**: Implement rate limiting for API endpoints
2. **CSRF Protection**: Add CSRF tokens for state-changing operations
3. **Content Security Policy**: Implement CSP headers
4. **Database Security**: Review and implement Row Level Security (RLS) policies
5. **Logging & Monitoring**: Add security event logging and monitoring
6. **Penetration Testing**: Conduct regular security testing
7. **Security Headers**: Implement security headers (HSTS, X-Frame-Options, etc.)

---

## 🚀 The Challenge: Security Audit & Remediation

As demonstrated above, this version of ALX Polly had several intentional security flaws that have now been identified and remediated. This provides a real-world scenario for understanding common web application vulnerabilities and their fixes.

**The security audit process involved:**

1.  **Identifying Vulnerabilities**:
    -   Thorough code review to find security weaknesses
    -   Analysis of authentication, authorization, and business logic
    -   Assessment of potential attack vectors

2.  **Understanding Impact**:
    -   Evaluation of potential data exposure
    -   Assessment of unauthorized action possibilities
    -   Risk analysis for each vulnerability

3.  **Implementing Fixes**:
    -   Writing secure, efficient code to patch security holes
    -   Ensuring fixes don't break existing functionality
    -   Following security best practices and industry standards

---

## Getting Started

To begin your security audit, you'll need to get the application running on your local machine.

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or higher recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   A [Supabase](https://supabase.io/) account (the project is pre-configured, but you may need your own for a clean slate).

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd alx-polly
npm install
```

### 3. Environment Variables

The project uses Supabase for its backend. An environment file `.env.local` is needed.Use the keys you created during the Supabase setup process.

### 4. Running the Development Server

Start the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

Good luck, engineer! This is your chance to step into the shoes of a security professional and make a real impact on the quality and safety of this application. Happy hunting!


