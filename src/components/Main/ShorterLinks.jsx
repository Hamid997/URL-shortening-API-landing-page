import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useClipboard } from "use-clipboard-copy";

export default function ShorterLinks() {
  const [links, setLinks] = useState(() => {
    const localData =
      typeof window !== "undefined" && JSON.parse(localStorage.getItem("links"));

    return localData ? localData : [];
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null); // Track the copied button index

  useEffect(() => {
    localStorage.setItem("links", JSON.stringify(links));
  }, [links]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async ({ link }) => {
    try {
      setLoading(true);

      const response = await fetch(`https://api.shrtco.de/v2/shorten?url=${link}`);

      const data = await response.json();

      if (data.ok) {
        setLinks((oldArray) => [
          ...oldArray,
          {
            original_link: link,
            full_short_link: data.result.full_short_link,
          },
        ]);

        setError(null);
        reset();
      } else {
        setError(data);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const clipboard = useClipboard();

  const handleCopyClick = async (index) => {
    try {
      setLoading(true);
      await clipboard.copy(links[index].full_short_link);
      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className={"form"}>
        <div className={"form-container"}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input
                id="link"
                type="text"
                placeholder="Shorten a link here..."
                className={errors.link || error ? "input-error" : ""}
                {...register("link", { required: "Please add a link" })}
              />

              {errors.link ? (
                <p className={"error-text"}>{errors.link.message}</p>
              ) : error ? (
                <p className={"error-text"}>{error.error}</p>
              ) : null}
            </div>

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "Loading..." : "Shorten It!"}
            </button>
          </form>
        </div>
      </section>

      <div className="shorter-container">
        {links.length
          ? links.map((link, index) => (
              <div key={index} className="shorter">
                <div className="shorter-original">
                  <a
                    href={link.original_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shorter-originalLink"
                  >
                    {link.original_link}
                  </a>
                </div>

                <div className="shorter-result">
                  <a
                    href={link.full_short_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shorter-fullShortLink"
                  >
                    {link.full_short_link}
                  </a>

                  <button
                    onClick={() => handleCopyClick(index)}
                    className="primary-btn"
                    style={{
                      backgroundColor:
                        copiedIndex === index ? "var(--Dark-Violet)" : "",
                    }}
                    disabled={loading}
                  >
                    {copiedIndex === index ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ))
          : null}
      </div>
    </>
  );
}
