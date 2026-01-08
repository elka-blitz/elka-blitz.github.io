# WebXR Device API via Github Pages

Compiled sample code accessed via index.html

In order to update the VRE on the page, the sample code must be modified, compiled and the result uploaded here

<img width="40%" height="862" alt="image" src="https://github.com/user-attachments/assets/414a39cf-86d6-4bf1-946c-105aa0333d98" />

*This can all be organised and made more intuitive, but as it stands currently, here are instructions for deployment:*

## Building and Deploying

### Step 1: Clone
- `git clone https://github.com/elka-blitz/elka-blitz.github.io.git`
- Then `cd sample_repo`

### Step 2: Modify code in `sample_repo`
- A lot of the main code is in `src/`

### Step 3: Build
- Run `npm run build` from `sample_repo/`

This will create a `dist` folder

### Step 4: Extract Build
From `sample_repo/`:
- Run `cd dist && cp * .. && cd ..`

### Step 5: Commit Extract
Add changes to be served:
- `git add assets && git add draco && git add index.html`
- `git commit -m 'Update X'`
- `git push`

Wait 2-3 minutes for the updated web page to deploy

Deployment can be monitored with:
- `gh run watch`
