const axios = require('axios');

// Try multiple potential ports
const ports = [5000, 8000, 4000];

async function testPort(port) {
  try {
    console.log(`Testing connection to Django on port ${port}...`);
    const response = await axios.get(`http://localhost:${port}/api/`);
    console.log(`✅ Successfully connected to Django on port ${port}!`);
    console.log(`Response:`, response.data);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`❌ Connection refused on port ${port} - Django not running here`);
    } else {
      console.log(`⚠️ Got error on port ${port}:`, error.message);
    }
    return false;
  }
}

async function testJobDataExtraction(port) {
  try {
    console.log(`\n🧪 Testing job data extraction endpoint on port ${port}...`);
    
    const sampleJobDescription = `
      Software Development Engineer at Prime Video
      
      Prime Video is a first-stop entertainment destination offering customers a vast collection of premium programming in one app available across thousands of devices. Prime members can customize their viewing experience and find their favorite movies, series, documentaries, and live sports – including Amazon MGM Studios-produced series and movies; licensed fan favorites; and programming from Prime Video add-on subscriptions such as Apple TV+, Max, Crunchyroll and MGM+.
      
      The ideal candidate will have:
      - Strong background in OO design
      - Solid time management/communication skills
      - 3+ years of front-end development experience
      
      Location: Remote, Seattle WA, or Arlington VA
      Job Type: Full-time
      Salary Range: $129,300 - $223,600 per year
    `;
    
    const response = await axios.post(
      `http://localhost:${port}/api/extract_job_data/`,
      {
        description: sampleJobDescription
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✅ Job data extraction successful!`);
    console.log(`Extracted Data:`, JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log(`❌ Job data extraction failed:`, error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing Django server connectivity...');
  
  let connectedPort = null;
  for (const port of ports) {
    const success = await testPort(port);
    if (success) {
      connectedPort = port;
      console.log(`\n✨ Django server confirmed running on port ${port}`);
      console.log(`Update your .env DJANGO_END_POINT to: http://localhost:${port}/api`);
      
      // Test the job data extraction endpoint
      await testJobDataExtraction(port);
      break;
    }
  }
  
  console.log('\n❌ Could not connect to Django on any tested port.');
  console.log('Please ensure Django server is running with:');
  console.log('cd D:\\Project\\JP\\jobapi');
  console.log('python manage.py runserver 5000');
}

main();
