# APK Downloads

Place the built APK files here:
- `intemso-v1.0.0.apk` - Current release

## Build the APK

From the mobile app directory:

```bash
cd apps/mobile
npm install
eas build -p android --profile preview
```

Download the APK from the EAS build dashboard and copy it here.

Then deploy to make it available at `https://intemso.com/downloads/intemso-v1.0.0.apk`.
