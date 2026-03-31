# Zoho CRM Custom Module Configuration Guide

## Overview
This guide will help you configure Zoho CRM to match your Marina Dubson CRM structure.

---

## Module 1: Contacts (Standard Module - Customize)

### Configuration Steps

1. **Navigate to Setup → Customization → Modules and Fields**
2. **Select "Contacts" module**
3. **Add/Modify Custom Fields:**

| Field Label | Field Name | Field Type | Required | Default Value |
|-------------|------------|------------|----------|---------------|
| Client Type | Client_Type | Picklist | Yes | - |
| Billing Contact Name | Billing_Contact_Name | Single Line | No | - |
| Billing Contact Email | Billing_Contact_Email | Email | No | - |
| Custom Pricing Enabled | Custom_Pricing_Enabled | Checkbox | No | false |
| Pricing Notes | Pricing_Notes | Multi Line | No | - |
| Status | Status | Picklist | Yes | Active |
| Notes | Notes | Multi Line | No | - |

### Client Type Picklist Values
```
Agency
Law Firm
Corporate
Private
Insurance
Government
```

### Status Picklist Values
```
Active
Inactive
```

### Layout Configuration
**Section 1: Contact Information**
- First Name
- Last Name
- Company Name
- Email
- Phone
- Client Type

**Section 2: Billing Information**
- Billing Contact Name
- Billing Contact Email

**Section 3: Pricing**
- Custom Pricing Enabled
- Pricing Notes

**Section 4: Additional**
- Status
- Notes

---

## Module 2: Services (Custom Module - Create New)

### Create Custom Module

1. **Navigate to Setup → Customization → Modules and Fields**
2. **Click "Create New Module"**
3. **Module Details:**
   - Module Name: `Services`
   - Module API Name: `Services`
   - Singular Label: `Service`
   - Plural Label: `Services`
   - Icon: Choose appropriate icon

### Add Custom Fields

| Field Label | Field Name | Field Type | Required | Default Value |
|-------------|------------|------------|----------|---------------|
| Service Name | Service_Name | Single Line | Yes | - |
| Category | Category | Picklist | Yes | - |
| Sub-Service | Sub_Service | Picklist | Yes | - |
| Default Minimum Fee | Default_Minimum_Fee | Currency | Yes | 400.00 |
| Page Rate | Page_Rate | Currency | Yes | - |
| Appearance Fee (Remote) | Appearance_Fee_Remote | Currency | Yes | - |
| Appearance Fee (In-Person) | Appearance_Fee_In_Person | Currency | Yes | - |
| Realtime Fee | Realtime_Fee | Currency | Yes | - |
| Expedite Immediate | Expedite_Immediate | Currency | Yes | - |
| Expedite 1 Day | Expedite_1_Day | Currency | Yes | - |
| Expedite 2 Days | Expedite_2_Day | Currency | Yes | - |
| Expedite 3 Days | Expedite_3_Day | Currency | Yes | - |
| Description | Description | Multi Line | No | - |
| Active | Active | Checkbox | Yes | true |

### Category Picklist Values
```
Court Reporting
Legal Proceedings
```

### Sub-Service Picklist Values
```
Depositions
Hearings
- `ARBITRATIONS` - Arbitration/Hearings
EUO
Trials
Administrative Hearings
Other
```

### Layout Configuration
**Section 1: Service Details**
- Service Name
- Category
- Sub-Service
- Description
- Active

**Section 2: Base Pricing**
- Default Minimum Fee
- Page Rate
- Appearance Fee (Remote)
- Appearance Fee (In-Person)
- Realtime Fee

**Section 3: Expedite Rates**
- Expedite Immediate
- Expedite 1 Day
- Expedite 2 Days
- Expedite 3 Days

---

## Module 3: Bookings (Custom Module - Create New)

### Create Custom Module

1. **Navigate to Setup → Customization → Modules and Fields**
2. **Click "Create New Module"**
3. **Module Details:**
   - Module Name: `Bookings`
   - Module API Name: `Bookings`
   - Singular Label: `Booking`
   - Plural Label: `Bookings`
   - Icon: Calendar icon

### Add Custom Fields

| Field Label | Field Name | Field Type | Required | Default Value |
|-------------|------------|------------|----------|---------------|
| Booking Number | Booking_Number | Auto Number | Yes | BK-{YYYY}-{MM}-{0000} |
| Client | Client | Lookup (Contacts) | Yes | - |
| Service | Service | Lookup (Services) | Yes | - |
| Proceeding Type | Proceeding_Type | Single Line | Yes | - |
| Jurisdiction | Jurisdiction | Single Line | No | - |
| State | State | Picklist | No | - |
| Booking Date | Booking_Date | Date | Yes | - |
| Booking Time | Booking_Time | Single Line | Yes | - |
| Location | Location | Single Line | No | - |
| Venue | Venue | Single Line | No | - |
| Appearance Type | Appearance_Type | Picklist | Yes | - |
| Turnaround Time | Turnaround_Time | Picklist | No | - |
| Special Requirements | Special_Requirements | Multi Line | No | - |
| Booking Status | Booking_Status | Picklist | Yes | Submitted |
| Invoice Status | Invoice_Status | Picklist | No | - |
| Notes | Notes | Multi Line | No | - |
| Cancellation Deadline | Cancellation_Deadline | DateTime | No | - |
| Confirmed At | Confirmed_At | DateTime | No | - |
| Is Marketplace | Is_Marketplace | Checkbox | No | false |

### Appearance Type Picklist Values
```
Remote
In-Person
```

### Turnaround Time Picklist Values
```
Standard (10 Business Days)
Expedite 3 Days
Expedite 2 Days
Expedite 1 Day
Immediate (Same Day)
```

### Booking Status Picklist Values (with Stage Mapping)
```
Submitted (Stage: Qualification)
Pending Review (Stage: Needs Analysis)
Maybe (Stage: Value Proposition)
Accepted (Stage: Proposal/Price Quote)
Confirmed (Stage: Negotiation/Review)
Completed (Stage: Closed Won)
Declined (Stage: Closed Lost)
Cancelled (Stage: Closed Lost)
```

### Invoice Status Picklist Values
```
Not Sent
Draft
Sent
Paid
Overdue
Cancelled
```

### State Picklist Values
```
(Add all US states + Canadian provinces)
Alabama
Alaska
...
Wyoming
Ontario
Quebec
...
```

### Layout Configuration
**Section 1: Booking Details**
- Booking Number (Read-only)
- Client (Lookup)
- Service (Lookup)
- Proceeding Type
- Booking Status
- Invoice Status

**Section 2: Scheduling**
- Booking Date
- Booking Time
- Appearance Type
- Location
- Venue
- Jurisdiction
- State

**Section 3: Service Requirements**
- Turnaround Time
- Special Requirements
- Is Marketplace

**Section 4: Administrative**
- Notes
- Cancellation Deadline
- Confirmed At

---

## Workflow Rules

### Workflow 1: Auto-Update Deal Stage Based on Booking Status

**Trigger:** When Booking Status changes

**Conditions:**
- Booking Status = "Submitted" → Deal Stage = "Qualification"
- Booking Status = "Pending Review" → Deal Stage = "Needs Analysis"
- Booking Status = "Maybe" → Deal Stage = "Value Proposition"
- Booking Status = "Accepted" → Deal Stage = "Proposal/Price Quote"
- Booking Status = "Confirmed" → Deal Stage = "Negotiation/Review"
- Booking Status = "Completed" → Deal Stage = "Closed Won"
- Booking Status = "Declined" or "Cancelled" → Deal Stage = "Closed Lost"

### Workflow 2: Send Confirmation Email

**Trigger:** When Booking Status = "Accepted"

**Action:** Send email to client requesting confirmation

**Email Template:**
```
Subject: Booking Confirmation Required - {Booking_Number}

Dear {Client.First_Name},

Your booking request has been approved!

Booking Details:
- Service: {Service.Service_Name}
- Date: {Booking_Date}
- Time: {Booking_Time}
- Location: {Location}

Please confirm this booking by clicking the link below:
{Confirmation_Link}

Thank you,
Marina Dubson Stenographic Services
```

### Workflow 3: Set Cancellation Deadline

**Trigger:** When Booking Status = "Confirmed"

**Action:** Update Cancellation Deadline = Booking Date - 48 hours

---

## Blueprint Configuration

### Booking Lifecycle Blueprint

**Stages:**
1. **Submitted** (Entry point)
   - Transition: Admin reviews → "Pending Review"
   
2. **Pending Review**
   - Transition: Needs info → "Maybe"
   - Transition: Approve → "Accepted"
   - Transition: Reject → "Declined"

3. **Maybe**
   - Transition: Info received → "Pending Review"
   - Transition: Approve → "Accepted"
   - Transition: Reject → "Declined"

4. **Accepted**
   - Transition: Client confirms → "Confirmed"
   - Transition: Client declines → "Cancelled"

5. **Confirmed**
   - Transition: Service complete → "Completed"
   - Transition: Cancel → "Cancelled"

6. **Completed** (End state)

7. **Declined** (End state)

8. **Cancelled** (End state)

---

## Custom Views

### View 1: Pending Bookings
**Filter:** Booking Status = "Submitted" OR "Pending Review" OR "Maybe"
**Sort:** Booking Date (Ascending)

### View 2: Confirmed Bookings
**Filter:** Booking Status = "Confirmed"
**Sort:** Booking Date (Ascending)

### View 3: This Week's Bookings
**Filter:** Booking Date = This Week AND Booking Status = "Confirmed"
**Sort:** Booking Date (Ascending)

### View 4: Awaiting Confirmation
**Filter:** Booking Status = "Accepted"
**Sort:** Created Time (Descending)

### View 5: Completed This Month
**Filter:** Booking Status = "Completed" AND Booking Date = This Month
**Sort:** Booking Date (Descending)

---

## Reports

### Report 1: Bookings Pipeline
**Type:** Funnel Report
**Module:** Bookings
**Group By:** Booking Status
**Show:** Count of Bookings

### Report 2: Revenue by Client
**Type:** Summary Report
**Module:** Bookings
**Group By:** Client
**Show:** Sum of Invoice Amount

### Report 3: Service Utilization
**Type:** Summary Report
**Module:** Bookings
**Group By:** Service
**Show:** Count of Bookings

### Report 4: Monthly Booking Trends
**Type:** Matrix Report
**Module:** Bookings
**Rows:** Booking Date (Month)
**Columns:** Booking Status
**Show:** Count of Bookings

---

## Dashboards

### Dashboard 1: Booking Operations
**Components:**
- Bookings Pipeline (Funnel Chart)
- This Week's Bookings (Table)
- Pending Confirmations (Table)
- Booking Status Distribution (Pie Chart)

### Dashboard 2: Revenue Analytics
**Components:**
- Monthly Revenue Trend (Line Chart)
- Top 10 Clients (Bar Chart)
- Service Revenue Breakdown (Pie Chart)
- Invoice Status (Funnel Chart)

---

## API Integration Setup

### Webhook Configuration

1. **Navigate to Setup → Developer Space → Webhooks**
2. **Create Webhook for Booking Creation:**
   - URL: `https://yourdomain.com/api/zoho/webhooks/booking-created`
   - Module: Bookings
   - Trigger: On Create
   - Method: POST

3. **Create Webhook for Booking Update:**
   - URL: `https://yourdomain.com/api/zoho/webhooks/booking-updated`
   - Module: Bookings
   - Trigger: On Update
   - Method: POST

### Connection Configuration

1. **Navigate to Setup → Developer Space → Connections**
2. **Create Connection:**
   - Service: Custom Service
   - Name: Marina Dubson Portal
   - Authentication: OAuth 2.0
   - Callback URL: Your portal webhook endpoint

---

## Testing Checklist

- [ ] Contact module fields created
- [ ] Services module created with all fields
- [ ] Bookings module created with all fields
- [ ] All picklist values configured
- [ ] Lookup relationships working
- [ ] Workflow rules active
- [ ] Blueprint configured
- [ ] Custom views created
- [ ] Reports created
- [ ] Dashboard configured
- [ ] Webhooks configured
- [ ] Test booking creation
- [ ] Test status transitions
- [ ] Test email notifications
- [ ] Test API sync

---

## Support Resources

- Zoho CRM Documentation: https://help.zoho.com/portal/en/kb/crm
- Zoho CRM API: https://www.zoho.com/crm/developer/docs/api/v2/
- Zoho Blueprint: https://help.zoho.com/portal/en/kb/crm/customize-crm-account/blueprint

---

## Next Steps

1. Complete Zoho CRM module configuration
2. Set up Zoho Books invoice templates
3. Configure Mailchimp automation
4. Test integration flow end-to-end
5. Train admin users on new system
