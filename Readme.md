# Employee Management System

A comprehensive Node.js-based employee management application built with Express.js and MySQL. This system enables multi-role user management including employees, admins, and management personnel, with features for profile management, attendance tracking, leave requests, vendor management, product ordering, and review systems.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)

---

## Project Overview

This Employee Management System is designed to streamline employee operations across an organization. It supports three main user roles:

- **Employees**: Can manage profiles, log attendance, request leaves, and order products from vendors
- **Admins**: Can add employees, manage vendors, approve leaves, and manage products
- **Management**: Can add categories, companies, packages, and manage management-level products

---

## Features

### Employee Features
- **Profile Management**: View and update employee profiles with photo upload
- **Attendance Tracking**: Log in and log out to track daily attendance
- **Leave Management**: Request and track leave applications
- **Vendor Management**: View vendors and their products
- **Product Ordering**: Add products to cart and place orders
- **Order Tracking**: Verify, dispatch, and track order delivery
- **Payment Processing**: Process order payments and handle returns
- **Product Reviews**: Add, update, and view product reviews

### Admin Features
- **Employee Management**: Add and manage employees with file uploads
- **Vendor Management**: Add and manage vendors
- **Product Management**: Add and update products with multiple image uploads
- **Leave Approval**: Review and approve/reject leave requests
- **Role & Team Management**: Create and manage team roles
- **Production Management**: Track production details
- **Brand Owner Management**: Manage brand owners (for manufacturers)

### Management Features
- **Category Management**: Add and manage product categories
- **Company Management**: Add company details
- **Product Management**: Add and manage management-level products
- **Package Management**: Create and manage service packages

---

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MySQL with Knex.js query builder
- **Authentication**: bcrypt for password hashing
- **File Upload**: Multer 2.0.2
- **Validation**: Joi for schema validation
- **Utilities**: Moment.js for date/time handling
- **Development**: Nodemon for auto-restart during development
- **Environment Management**: dotenvx

---

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/nithin2202/employee_managment_node.JS.git
   cd employee
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (see Configuration section)

4. **Start the server**
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:8081`

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
dbHost=localhost
dbPort=3306
dbName=employee_db
dbUser=root
dbPassword=your_password
```

The application uses dotenvx for secure configuration management. You can also use a `.env.keys` file for encrypted keys.

### Database Connection

Database configuration is defined in `config/config.js` and uses Knex.js with MySQL2 driver. The database instance is created in `config/mysqlDB.js` using a singleton pattern.

---

## Project Structure

```
employee/
├── app.js                          # Main application entry point
├── package.json                    # Project dependencies
├── config/
│   ├── config.js                   # Database configuration
│   └── mysqlDB.js                  # Database instance
├── src/
│   ├── controllers/
│   │   └── empcontroller.js        # Main controller for all operations
│   ├── middleware/
│   │   └── fileupload.js           # Multer file upload configuration
│   ├── models/
│   │   └── empmodels.js            # Database models and queries
│   ├── routes/
│   │   ├── app.js                  # Main router
│   │   ├── auth/
│   │   │   ├── employee.js         # Employee routes
│   │   │   ├── admin.js            # Admin routes
│   │   │   └── managment.js        # Management routes
│   │   └── unAuth/
│   │       └── unAuth.js           # Unauthenticated routes (login, password reset)
│   ├── uploads/                    # Uploaded files storage
│   │   ├── check/                  # Employee verification documents
│   │   ├── profile/                # Employee profile pictures
│   │   ├── product_images/         # Product images (employee orders)
│   │   ├── mgmt_product_images/    # Product images (management)
│   │   └── manufacture_product_images/  # Manufacturer product images
│   └── utils/
│       ├── filevalidate.js         # File validation utility
│       └── copy.js                 # File copy and delete utilities
└── Readme.md                       # This file
```

---

## API Endpoints

### Unauthenticated Routes (`/unauth`)
- `GET /unauth/login` - Employee login
- `POST /unauth/user` - Check if user exists
- `POST /unauth/answers` - Verify security answers
- `PUT /unauth/password` - Create new password (password reset)
- `POST /unauth/question` - Create security question
- `PUT /unauth/updatequestion/:id` - Update security question
- `GET /unauth/getquestion/:id` - Get specific security question
- `GET /unauth/getallquestions` - Get all security questions
- `DELETE /unauth/deletequestion/:id` - Delete security question

### Employee Routes (`/auth/emp`)
- `GET /profile/:id` - Get employee profile
- `PUT /updateprofile/:id` - Update employee profile (with file upload)
- `POST /addlogin` - Log attendance
- `PUT /addlogout` - Log logout
- `POST /leave/:id` - Request leave
- `POST /vendor/:id` - Add vendor
- `GET /getvendor/:id` - Get vendors for employee
- `GET /getallvendors` - Get all vendors
- `GET /getemp/:id` - Get employee dropdown list
- `POST /product/:id` - Add product to cart
- `GET /getproducts/:id` - Get products for employee
- `POST /vendor/addtocart/:id` - Add product to cart by vendor
- `PUT /verifyorder/:verify_id/:id` - Verify order
- `PUT /dispatchorder/:dispatch_id/:id` - Dispatch order
- `POST /deliver` - Get order delivery details
- `PUT /order/payment/:vendor_id/:id` - Process payment
- `POST /order/return/:vendor_id` - Request product return
- `PUT /order/returnverify/:dispatcher_id/:return_id` - Verify return
- `GET /order/pagination/:vendorId` - Get paginated orders
- `POST /review/:vendorId/:productId` - Add product review
- `PUT /review/update/:reviewId` - Update review
- `DELETE /review/delete/:reviewId` - Delete review
- `GET /review/get/:productId` - Get reviews for product

### Admin Routes (`/auth/admin`)
- `POST /addemp/:id` - Add new employee (with file upload)
- `GET /getall/:id` - Get all employees
- `GET /managers/:admin_id/:id/:role_id` - Get all managers
- `POST /addvendor/:id` - Add vendor
- `GET /getvendor/:id` - Get vendors
- `POST /addproduct/:id` - Add product (with multiple images)
- `PUT /updateproduct/:id` - Update product (with images)
- `PUT /updateproduct1/:imageid` - Update single product image
- `PUT /leavestatus/:id` - Approve/reject leave
- `GET /getpackage/:id` - Get company packages
- `POST /addTeam/:id` - Create role type
- `POST /addproduction/:id` - Create production record
- `POST /addbrandowner/:id` - Add brand owner
- `POST /addmanufactureproduct/:id` - Add manufacture product (with images)

### Management Routes (`/auth/mgmt`)
- `POST /addcategory/:id` - Add product category
- `GET /getcategory/:id` - Get product categories
- `POST /addcompany/:id` - Add company details
- `POST /addproduct/:id` - Add management product (with images)
- `GET /getproduct/:id` - Get management products
- `POST /addpackage/:id` - Create service package

---

## Usage

### Starting the Server

Development mode (with auto-restart):
```bash
npm run dev
```

### File Upload

The application supports file uploads through Multer:

- **Single file upload**: Profile pictures, employee verification documents
- **Multiple file upload**: Product images (up to 3 images per product)

Allowed file formats: `.jpg`, `.jpeg`, `.png`, `.webp`
Maximum file size: 2MB per file

Files are temporarily stored in `/tmp/` and then moved to the appropriate upload folder in `src/uploads/`.

### Validation

The application uses Joi for schema validation on all endpoints:

- Email format validation
- Password complexity requirements (Must start with uppercase, contain alphanumeric)
- Contact number validation (minimum 10 digits)
- PAN number format validation (Indian PAN format: AABBU1234H)
- File type and size validation

### Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "message": "Success message",
  "data": {}
}
```

**Error Response:**
```json
{
  "message": "Error message"
}
```

Status codes:
- `200` - Success
- `409` - Server/Database error
- `422` - Validation error
- `404` - Route not found

---

## Running the Application

1. Ensure MySQL is running and database credentials are configured in `.env`
2. Run `npm run dev` to start the development server
3. The API will be available at `http://localhost:8081`
4. All requests should include appropriate data and file uploads as per the endpoint requirements

---

## License

ISC

## Author

Nithin2202
