export async function fetchApiLogin(url, method, body = null) {
  try {
    const options = { 
      method, 
      headers: {
        'Content-Type': 'application/json',
      }, 
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    console.log(data);
    return data;
  } catch (error) {
    console.error("Erro na API:", error);
    return { error: true, message: error.message };
  }
}
