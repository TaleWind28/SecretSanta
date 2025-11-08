<script lang="ts">
    import { parseCSV, rulesMessage, type overlap } from "$lib";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Select from "$lib/components/ui/select/index";
    import * as Dialog from "$lib/components/ui/dialog/index";
    import { onMount } from "svelte";
    
    let participants:string[] = $state([]);
    let rules: overlap[];
    let user = $state("");
    let draw = $state("");
    let noUserFound = $state(false);
    let alreadyDrawn = $state(false);
    let showDrawDialog = $state(false);

    const triggerUser = $derived(
        participants.find((f) => f === user)?? ""
    );

    onMount(async () => {
        const res = await fetch('/data/participants.csv');
        const text = await res.text();
        rules = parseCSV(text);
        for (let entry of rules){
            participants.push(entry.user)
        }
        console.log(rules);
    });

    async function handleClick(){
        if (user === ""){
            noUserFound = true;
            return
        }; 

        let selectedBlackList = rules.find((u)=> u.user === user)?.blackList ?? [];

        //creazione di houseRules per consentire la corretta estrazione
        const houseRules = {
            user: user,
            blackList: [...selectedBlackList]
        }

        try {
            const response = await fetch('/api/',{
				method:'PUT',
				headers:{
					'Content-Type':'application/json'
				},
				body:JSON.stringify({
					rules: houseRules
				})
				
			});

            const data = await response.json();
            if(!data.success){
                console.error("put failure");
            }else{
                console.log("put success");
                draw = data.drawn
            }
            
        } catch (err) {
            console.error("Errore nella put:", err);
        }
        //settaggio variabili
        alreadyDrawn = true
        showDrawDialog = true
        return 
    }

    $inspect(draw)


</script>


<div class="flex flex-col items-center justify-center gap-5">
    <h1>Secret Santa</h1>
    <p class="flex flex-col items-center p-10">
        {@html rulesMessage.replace(/\n/g, '<br>')}
    </p>    
    <div class="flex items-center gap-5">
        Chi sei?
        <Select.Root type="single" bind:value={user}>
            <Select.Trigger> 
                {triggerUser}
            </Select.Trigger>
            <Select.Content> 
                
                {#each participants as person}
                    <Select.Item value={person}>{person}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>
    </div>

    <Button disabled = {alreadyDrawn} onclick={handleClick}> 
        Estrai
    </Button>
    {#if alreadyDrawn}
        <p> 
            Sei il babbo natale segreto di {draw}
        </p>
    {/if}
</div>

<Dialog.Root bind:open={showDrawDialog}>
    <Dialog.Content>
        <Dialog.Header>
        <Dialog.Title>Sei il Babbo Natale Segreto di </Dialog.Title>
        <Dialog.Description>
            <p class=" text-5xl">{draw}!</p>
        </Dialog.Description>
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>
    





