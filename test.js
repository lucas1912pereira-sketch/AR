const fs = require('fs');
async function test() {
    const formData = new FormData();
    formData.append('id', '2');
    formData.append('nombre', 'Hamburguesa File Test');
    formData.append('precio', '60000');
    formData.append('categoria', 'Test');
    
    // Create a dummy file blob
    const blob = new Blob(['dummy content'], { type: 'text/plain' });
    formData.append('imagen', blob, 'test.txt');
    
    const res = await fetch("https://menu-api.lucas1912pereira.workers.dev", {
        method: 'POST',
        body: formData
    });
    
    console.log(await res.text());
}
test();
