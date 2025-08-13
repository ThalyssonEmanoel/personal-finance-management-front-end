export async function fetchApiLogin(url, method) {
  try {
    const options = { method, headers: {}, };
    const response = await fetch(url, options);
    const data = await response.json();

    console.log(data);
    return data;
  } catch (error) {
    console.error("Erro na API:", error);
    return { isError: true, message: error.message };
  }
}
