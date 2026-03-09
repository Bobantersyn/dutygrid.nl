async function run() {
    try {
        const res = await fetch('http://localhost:5005/api/internal/staging-tools/nuke-companies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': 'token=true' },
            body: '{}'
        });
        const json = await res.json();
        console.log("STATUS:", res.status);
        if (json.details && json.details.stack) {
            console.log(json.details.stack);
        } else {
            console.log(json);
        }
    } catch (e) {
        console.error(e);
    }
}
run();
