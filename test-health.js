// Quick health check script
// Run this with: node test-health.js

async function checkHealth() {
  try {
    console.log('🔍 Checking Vanta API health...\n');
    
    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();
    
    console.log('Status:', data.status);
    console.log('\n📊 Database Tables:');
    console.log('  Campaigns:', data.database?.tables?.campaigns?.status || 'unknown');
    console.log('  Leads:', data.database?.tables?.leads?.status || 'unknown');
    
    console.log('\n🔑 Environment Variables:');
    console.log('  Supabase URL:', data.environment?.supabaseUrl);
    console.log('  Supabase Key:', data.environment?.supabaseKey);
    console.log('  Resend Key:', data.environment?.resendKey);
    console.log('  Together AI Key:', data.environment?.togetherKey);
    console.log('  Bright Data Key:', data.environment?.brightDataKey);
    
    if (data.status === 'error') {
      console.log('\n❌ Error:', data.error);
      console.log('\n📝 Next Steps:');
      console.log('  1. Open Supabase SQL Editor');
      console.log('  2. Run supabase-schema.sql');
      console.log('  3. Run supabase-functions.sql');
      console.log('  4. Retry this health check');
    } else if (data.status === 'degraded') {
      console.log('\n⚠️  Some tables are missing. Run the SQL scripts in Supabase.');
    } else {
      console.log('\n✅ Everything looks good! Your app is ready to use.');
    }
    
  } catch (error) {
    console.error('❌ Failed to check health:', error.message);
    console.log('\n💡 Make sure the dev server is running: npm run dev');
  }
}

checkHealth();
