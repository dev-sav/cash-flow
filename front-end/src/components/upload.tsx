"use client";
import { useForm } from "react-hook-form";

const Upload = () => {
  const { handleSubmit, register } = useForm();
  const handleUpload = async (data) => {
    console.log("mavuika");
    console.log(JSON.stringify(data));

    const formData = new FormData();
    formData.append("pdfFile", data.pdfFile[0]);

    console.log(formData.get("pdfFile"));

    try {
      await fetch("http://localhost:8081/extract-text", {
        method: "post",
        body: formData,
      })
        .then((response) => {
          return response.text();
        })
        .then((extractedTxt) => {
          console.log(extractedTxt);
        });
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit(handleUpload)}>
        <input {...register("pdfFile")} type="file" accept="application/pdf" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Upload;
