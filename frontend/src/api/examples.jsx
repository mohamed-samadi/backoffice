// Examples of API usage with the config module

import { useState, useEffect } from "react";
import { fetchApi, getApiUrl, buildApiUrl } from "@/api/config";

// Simple fetch example
export function ExampleSimpleFetch() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/api/products")
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

// POST example
export function ExamplePostData() {
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetchApi("/api/products", {
        method: "POST",
        body: JSON.stringify({
          name: "New Product",
          price: 99.99,
        }),
      });

      console.log("Created:", response);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Create Product</button>
    </form>
  );
}

// Raw URL example
export function ExampleRawUrl() {
  const apiUrl = getApiUrl();
  const productUrl = buildApiUrl("/api/products/123");

  return (
    <div>
      <p>Base API: {apiUrl}</p>
      <p>Product URL: {productUrl}</p>
    </div>
  );
}

// Auth example
export function ExampleWithAuth() {
  const handleAuthedRequest = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetchApi("/api/protected-resource", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      console.log("Protected data:", response);
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  return <button onClick={handleAuthedRequest}>Get Protected Data</button>;
}
