## mb-projects-migration

Migration tool to copy Music Blocks projects from a MySQL database into GitHub repositories using a GitHub App. 
Tested by migrating 200 Music Blocks projects at https://github.com/orgs/mb-test-org-123/repositories

### Steps to run:

1. Create a `.env` with values from `.env.example`

2. Install dependencies:

`npm install`

Run:

`node src/index.js --start-id [number] --end-id [number]`

Example:

`node src/index.js --start-id 1 --end-id 50`
