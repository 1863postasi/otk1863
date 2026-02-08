
# 0. Build the Project
// turbo
npm run build

# 1. Deploy Firestore Rules and Indexes (If changed - Safe to run)
// turbo
firebase deploy --only firestore

# 2. Deploy Functions (If changed - Safe to run)
// turbo
firebase deploy --only functions

# 3. Deploy Hosting (PWA)
// turbo
firebase deploy --only hosting
