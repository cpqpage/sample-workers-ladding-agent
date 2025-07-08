<script lang="ts">
    import { onMount } from 'svelte';
    import { _, locale } from 'svelte-i18n';

    let errorMessage = $_('error.unknownError');

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const message = urlParams.get('message');
        
        if (message) {
            errorMessage = decodeURIComponent(message);
            locale.subscribe((currentLocale) => {
                const localMsg = $_("error." + errorMessage);

                if(localMsg != "error." + errorMessage) {
                    errorMessage = localMsg;
                }
            });
            
        }
    });
</script>

<div class="error-container">
    <h1>{$_('error.errorHappened')}</h1>
    <p class="error-message">{errorMessage}</p>
    <div class="flex gap-4">
        <a href="/logout" class="home-link">{$_('error.backToLogin')}</a>
        <button type="button" onclick={() => window.history.back()} class="home-link">{$_('buttons.back')}</button>
    </div>
</div>

<style>
    .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        text-align: center;
    }

    h1 {
        color: #e74c3c;
        margin-bottom: 1rem;
    }

    .error-message {
        color: #666;
        margin-bottom: 2rem;
        max-width: 600px;
        line-height: 1.5;
    }

    .home-link {
        display: inline-block;
        padding: 0.8rem 1.5rem;
        background-color: #3498db;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .home-link:hover {
        background-color: #2980b9;
    }
</style>