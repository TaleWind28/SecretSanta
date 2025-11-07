<script lang="ts">
    import { giftMatchingSystem, parseCSV, rulesMessage, type overlap } from "$lib";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Select from "$lib/components/ui/select/index";
    import { onMount } from "svelte";
    
    let participants:string[] = $state([]);
    let rules: overlap[];
    let user = $state("");
    let dodge: string = $state("");
    let draw = $state("");
    let noUserFound = $state(false);

    const triggerUser = $derived(
        participants.find((f) => f === user)?? ""
    );

    const triggerDodge = $derived(
        participants.find((p)=>p === dodge) ?? ""
    )
    
    onMount(async () => {
        const res = await fetch('/data/participants.csv');
        const text = await res.text();
        rules = parseCSV(text);
        for (let entry of rules){
            participants.push(entry.user)
        }
        console.log(rules);
    });

    let dodgeSelected = $derived.by(
        ()=> dodge.length === 0 ? "" : "Hai scelto di evitare qualcuno"
    );
    // $inspect(dodge.length)

    let alreadyDrawn = $state(false)

    async function handleClick(){
        if (user === ""){
            noUserFound = true;
            return
        }; 

        let selectedBlackList = rules.find((u)=> u.user === user)?.blackList ?? [];

        
        const url = `/api/`;

        //creazione di houseRules per consentire la corretta estrazione
        const houseRules = {
            user: user,
            blackList: [...selectedBlackList,dodge]
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
        return 
    }

    $inspect(draw)


</script>


<div class="flex flex-col items-center justify-center gap-5">
    <h1>Secret Santa</h1>
    <p>
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

     <div class="flex items-center gap-5">
        Devi Evitare Qualcuno?
        <Select.Root type="single" bind:value={dodge}>
            <Select.Trigger> 
               {triggerDodge}
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
    





