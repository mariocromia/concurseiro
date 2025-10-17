/**
 * Generate VAPID keys for push notifications
 *
 * Run: node scripts/generate-vapid-keys.cjs
 *
 * @author Claude Code
 * @date 2025-10-17
 */

const webpush = require('web-push')

console.log('🔑 Generating VAPID keys for push notifications...\n')

const vapidKeys = webpush.generateVAPIDKeys()

console.log('✅ VAPID keys generated successfully!\n')
console.log('Add these to your .env file:\n')
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey)
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey)
console.log('VAPID_EMAIL=mailto:noreply@prapassar.com\n')
console.log('⚠️  Keep the PRIVATE key secret! Never commit it to Git.\n')
