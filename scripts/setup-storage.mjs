// One-time setup on independent hosting. Secret is read from the environment, never logged.
const key = process.env.EXTERNAL_SUPABASE_SECRET_KEY;
if (!key) throw new Error('Set EXTERNAL_SUPABASE_SECRET_KEY first');
const response = await fetch('https://pgssrcadvcwxmvuhfozu.supabase.co/storage/v1/bucket', {
 method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' },
 body: JSON.stringify({ id: 'artworks', name: 'artworks', public: false, file_size_limit: 10485760, allowed_mime_types: ['image/webp', 'image/jpeg', 'image/png', 'image/avif'] }),
});
if (response.ok) console.log('Private artwork storage is ready');
else {
 const data = await response.json();
 if (String(data.message ?? '').includes('already exists') || response.status === 409) console.log('Artwork storage already exists');
 else throw new Error(`Storage setup failed: HTTP ${response.status}`);
}
