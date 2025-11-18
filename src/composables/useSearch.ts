import { ref } from 'vue';


export function useSearch() {
  const query = ref('');
  const results = ref<any[]>([]);
  const loading = ref(false);


  async function search(text: string) {
    query.value = text;
    loading.value = true;
    results.value = [];


    // integrate: scan all monaco models
    await new Promise(r => setTimeout(r, 200));


    loading.value = false;
    return results.value;
  }


  return { query, results, loading, search };
}