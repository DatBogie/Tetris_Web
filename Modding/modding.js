const filePicker = document.getElementById("file");
const output = document.getElementById("output");
const copy = document.getElementById("copy");
const typesMap = [
    "data:audio/mpeg;base64",
    "data:application/ogg;base64",
    "data:audio/wav;base64"
];
filePicker.addEventListener("change",()=>{
    const file = filePicker.files[0];
    const reader = new FileReader();
    reader.onload = ()=>{
        const data = reader.result.split(",");
        if (typesMap.indexOf(data[0]) === -1) {
            const es = `Invalid/unsupported file type: ${data[0].replaceAll("data:","").replaceAll(";base64","").split("/")[1]}!\nOnly mp3, ogg, and wav are supported.`;
            console.error(es);
            return alert(es);
        }
        output.textContent = JSON.stringify({
            "Format": data[0],
            "Data": data[1]
        },undefined,4);
    }
    reader.readAsDataURL(file);
});
output.addEventListener("focus",()=>{
    output.select();
});
copy.addEventListener("click",()=>{
    const text = output.textContent;
    if (text === "") return;
    output.focus();
    navigator.clipboard.writeText(text);
    alert("Copied!")
});