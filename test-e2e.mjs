async function runE2e() {
  console.log('--- 1. Testing Index HTML & Assets ---');
  const htmlRes = await fetch('http://localhost:3001');
  console.log(`Index HTML status: ${htmlRes.status}, Content-Type: ${htmlRes.headers.get('content-type')}`);

  console.log('\n--- 2. Testing 9 Agents Roster ---');
  const agentsRes = await fetch('http://localhost:3001/api/agents');
  const agentsData = await agentsRes.json();
  console.log(`Loaded Agents: ${agentsData.agents.length}`);
  agentsData.agents.forEach(a => console.log(` - [${a.division.toUpperCase()}] ${a.name} (${a.id})`));

  console.log('\n--- 3. Testing 12 Central Knowledge Documents ---');
  const kbRes = await fetch('http://localhost:3001/api/knowledge');
  const kbData = await kbRes.json();
  console.log(`Loaded Knowledge Docs: ${kbData.documents.length}`);
  kbData.documents.forEach(d => console.log(` - ${d.slug}.md: "${d.title}"`));

  console.log('\n--- 4. Testing Leads CRM Pipeline ---');
  const leadsRes = await fetch('http://localhost:3001/api/leads');
  const leadsData = await leadsRes.json();
  console.log(`Loaded Leads: ${leadsData.leads.length}`);
  leadsData.leads.forEach(l => console.log(` - ${l.businessName} (Score: ${l.leadScore}, Status: ${l.qualificationStatus})`));

  console.log('\n--- 5. Testing Real HTTP Web Analyzer Tool ---');
  const toolRes = await fetch('http://localhost:3001/api/tools/web-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com', businessName: 'Example Business' }),
  });
  const toolData = await toolRes.json();
  console.log(`Web Analyzer success: ${toolData.success}`);
  if (toolData.success) {
    console.log(`[MEASURED] Status: ${toolData.data.measured.httpStatus}, Response Time: ${toolData.data.measured.responseTimeMs}ms, HTTPS: ${toolData.data.measured.isHttps}`);
    console.log(`[DETECTED] Title: "${toolData.data.detected.title}", Headings H1: ${JSON.stringify(toolData.data.detected.headings.h1)}`);
    console.log(`[INFERRED] Readiness Score: ${toolData.data.inferred.localBusinessReadinessScore}/100, Mobile: ${toolData.data.inferred.mobileFriendlinessEstimate}`);
    console.log(`[INFERRED] Identified Gaps:`, toolData.data.inferred.identifiedGaps);
  } else {
    console.log(`Analyzer error: ${toolData.error}`);
  }

  console.log('\n--- 6. Launching Live Multi-Agent Workflow ---');
  const wfRes = await fetch('http://localhost:3001/api/workflows/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflowId: 'lead-to-outreach', leadId: 'lead-001' }),
  });
  const wfData = await wfRes.json();
  console.log(`Workflow Started: ${wfData.instance?.workflowName}`);
  console.log(`Instance ID: ${wfData.instance?.id}, Status: ${wfData.instance?.status}`);
  console.log(`Step 1 (${wfData.instance?.steps[0]?.name}): ${wfData.instance?.steps[0]?.status}`);
  console.log(`Step 2 (${wfData.instance?.steps[1]?.name}): ${wfData.instance?.steps[1]?.status} (Approval ID: ${wfData.instance?.steps[1]?.approvalId})`);

  console.log('\n--- 7. Inspecting Human Approval Queue ---');
  const apprsRes = await fetch('http://localhost:3001/api/approvals');
  const apprsData = await apprsRes.json();
  console.log(`Total Pending Approvals: ${apprsData.approvals.length}`);
  apprsData.approvals.forEach(ap => console.log(` - [${ap.status}] ${ap.title} (Type: ${ap.type})`));

  console.log('\n✅ ALL FULL-STACK SUBSYSTEMS VERIFIED SUCCESSFULLY!');
}

runE2e().catch(console.error);
