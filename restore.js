async function restore() {
    // Fetch original image
    const imgRes = await fetch("https://pub-a0c3e42adcc7481ca1b17d7e005659b6.r2.dev/1790354841751_hamburguesa_(1).png");
    const imgBuffer = await imgRes.arrayBuffer();
    const blob = new Blob([imgBuffer], { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('id', '2');
    formData.append('nombre', 'Hamburguesa');
    formData.append('precio', '50000');
    formData.append('categoria', 'Principales');
    formData.append('imagen', blob, '1790354841751_hamburguesa_(1).png');
    
    const res = await fetch("https://menu-api.lucas1912pereira.workers.dev", {
        method: 'POST',
        body: formData
    });
    
    console.log(await res.text());
}
restore();
