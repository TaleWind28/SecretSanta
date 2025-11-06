<script lang="ts">
    import { giftMatchingSystem, type overlap } from "$lib";
    import Button from "$lib/components/ui/button/button.svelte";
    import * as Select from "$lib/components/ui/select/index";
    import { onMount } from "svelte";
    
    let participants:string[] = $state([])
    let rules: overlap[]
    let user = $state("")
    let dodge: string[] = $state([])
    let draw = $state("")

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

    function parseCSV(csv: string) : overlap[]{
        const lines = csv.trim().split('\n');
        const headers = lines.shift()?.split(',') ?? [];
        
        return lines.map(line => {
            const [user, rawBlacklist] = line.split(',');
            const blackList = 
                rawBlacklist ? rawBlacklist.replace(/"/g, '').split(',').map(s => s.trim()).filter(Boolean) : [];
                return { user: user.trim(), blackList };
            }
        );
    }

    let dodgeSelected = $derived.by(
        ()=> dodge.length === 0 ? "" : "Hai scelto di evitare qualcuno"
    );
    $inspect(dodge.length)

    let alreadyDrawn = $state(false)

    function handleClick(){
        if (user === ""){
            return
        }; 
        let selectedBlackList = rules.find((u)=> u.user === user)?.blackList ?? [];

        const houseRules = {
            user: user,
            blackList: [...selectedBlackList,...dodge]
        }

        // console.log(houseRules)
        //chiamata all'algoritmo per scegliere
        draw = giftMatchingSystem(houseRules,participants)
        //settaggio variabili
        alreadyDrawn = true
        return 
    }

    let response = $state("");
    $inspect(draw)
</script>


<div class="flex flex-col items-center justify-center gap-5">
    <h1>Secret Santa</h1>
    <p>
        Messaggio Regole
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
        <Select.Root type="multiple" bind:value={dodge}>
            <Select.Trigger> 
               {dodgeSelected}
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
    





