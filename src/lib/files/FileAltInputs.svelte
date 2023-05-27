<script>
  import { createEventDispatcher, onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import iconFile from "@iconify-icons/ic/outline-file-present";
  import { page } from "$app/stores";
  import { sharedAxisTransition } from "m3-svelte";

  const dispatch = createEventDispatcher();
  let currentX = 0,
    currentY = 0,
    hide = true;

  let hashStatus = { shown: false };
  const setHashStatus = (text) => {
    const hideTimeout = setTimeout(() => {
      hashStatus = { shown: false };
    }, 5000);
    if (hashStatus.hideTimeout) clearTimeout(hashStatus.hideTimeout);
    hashStatus = { shown: true, text, hideTimeout };
  };
  const receiveFile = async () => {
    const hash = $page.url.searchParams.get("rat-to-peer-hash");
    if (!hash) return;
    setHashStatus("Connecting");

    const ws = new WebSocket("wss://rat-to-peer.onrender.com");
    await new Promise((resolve) => ws.addEventListener("open", resolve));
    ws.send(JSON.stringify({ type: "get-file", hash }));

    setHashStatus("Receiving file");
    const replyMessage = await new Promise((resolve) => {
      const handleMessage = (m) => {
        ws.removeEventListener("message", handleMessage);
        resolve(m);
      };
      ws.addEventListener("message", handleMessage);
    });
    const reply = JSON.parse(replyMessage.data);
    console.log("received file as", reply);
    if (reply.type == "error") {
      setHashStatus(reply.message);
      if (ws.readyState == WebSocket.OPEN) ws.close();
      return;
    }
    setHashStatus("File received");

    const file = new File([Uint8Array.from(reply.data, (c) => c.charCodeAt(0))], reply.name);
    dispatch("chosen", file);
  };
  const downloadFile = async () => {
    const url = $page.url.searchParams.get("rat-to-peer-url");
    if (!url) return;

    setHashStatus("Receiving file");
    const resp = await fetch(
      "https://rat-to-peer.onrender.com/file?url=" + encodeURIComponent(url)
    );
    const data = await resp.blob();
    console.log("received file as", data);
    setHashStatus("File received");

    const file = new File([data], url.split("/").at(-1));
    dispatch("chosen", file);
  };

  onMount(() => Promise.all([receiveFile(), downloadFile()]));
</script>

<svelte:window
  on:dragover={(e) => {
    hide = !e.dataTransfer.types.includes("Files");
    if (hide) return;
    e.preventDefault();
    (currentX = e.clientX), (currentY = e.clientY);
  }}
  on:drop={(e) => {
    hide = true;
    const file = e.dataTransfer.files[0];
    if (!file) return;
    e.preventDefault();
    dispatch("chosen", file);
  }}
  on:dragleave={() => (hide = true)}
  on:dragexit={() => (hide = true)}
  on:paste={(e) => {
    const file = e.clipboardData.files[0];
    if (!file) return;
    e.preventDefault();
    dispatch("chosen", file);
  }}
/>
<div
  class="dragover-positioning fixed rounded-2xl bg-primary-container text-on-primary-container"
  class:custom-hide={hide}
  style="left: {currentX}px; top: {currentY}px;"
>
  <Icon icon={iconFile} height={32} />
</div>
{#if hashStatus.shown}
  <div
    class="hash-status rounded-lg bg-primary-container p-4 text-on-primary-container"
    transition:sharedAxisTransition={{ direction: "Y", rightSeam: false }}
  >
    <p class="font-bold">rat-to-peer</p>
    <p>{hashStatus.text}</p>
  </div>
{/if}

<style lang="postcss">
  .dragover-positioning {
    @apply flex h-16 w-16 items-center justify-center overflow-hidden;
    transition: clip-path 0.5s, opacity 0.5s;
    transform: translate(-50%, -50%);
    clip-path: circle(2.829rem);
  }
  .custom-hide {
    clip-path: circle(0);
    opacity: 0;
  }
  .hash-status {
    @apply fixed bottom-4 right-4;
  }
</style>
