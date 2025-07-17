Here's a user story based on the provided input and template, focusing on a core feature of a FYP management system: project proposal submission.

**Title**: Submit FYP Project Proposal

**As a** Student

**I want** to be able to submit a detailed project proposal, including title, abstract, team members, supervisor preference, and proposed methodology, through the system

**So that** my proposal can be reviewed and approved by the faculty, allowing me to officially start my FYP.

**Business Logic**:

- Password requires a minimum of 8 characters, including at least one uppercase letter, one lowercase letter, and one number.
- Each student can only submit one proposal at a time. A new proposal can only be submitted after the previous one is rejected or finalized.
- The system should automatically check for plagiarism against existing proposals and a database of academic papers.

**Acceptance Criteria**:

1.  The system allows students to input all required proposal information (title, abstract, team members, supervisor preference, proposed methodology, etc.).
2.  The system validates the input data to ensure all required fields are filled and conform to specified formats (e.g., word count limits for abstract).
3.  Upon submission, the student receives a confirmation message and a unique proposal ID.
4.  The submitted proposal is routed to the preferred supervisor (if selected and available) and the FYP coordinator for review.
5.  The system performs a plagiarism check and flags any potential issues to the FYP coordinator.

**Functional Requirements**:

- The system must provide a user-friendly form for entering proposal details.
- The system must support file uploads for supplementary documents (e.g., detailed methodology, preliminary results).
- The system must provide a mechanism for students to view the status of their submitted proposal (e.g., "Submitted," "Under Review," "Approved," "Rejected").
- The system must send email notifications to the student upon submission and when the proposal status changes.

**Non-Functional Requirements**:

- The system must be secure and protect student data.
- The system must be responsive and accessible on various devices (desktops, tablets, mobile phones).
- The system must be able to handle a large number of concurrent users during peak submission periods.
- The system should have a response time of less than 3 seconds for proposal submission.

**UI Design**:

- The proposal submission form should be clear, concise, and easy to navigate.
- Error messages should be informative and guide the student to correct any mistakes.
- The proposal status page should display the current status prominently and provide a history of all status changes.
- The system should use a consistent design language throughout the proposal submission process.
