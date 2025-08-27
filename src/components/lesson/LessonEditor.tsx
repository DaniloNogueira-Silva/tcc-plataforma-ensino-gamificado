import React from "react";
import { Editor } from "@tinymce/tinymce-react";

const LessonEditor = ({ value, onChange }) => {
  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINY_SECRET_KEY}
      value={value || "<p>Escreva o conteúdo da questão aqui.</p>"}
      init={{
        height: 400, 
        menubar: false,

        plugins: [
          "autolink",
          "lists",
          "link",
          "image",
          "table",
          "wordcount",
          "fullscreen",
        ],

        toolbar:
          "undo redo |  blocks | fontselect fontsizeselect | bold italic underline | " +
          "alignleft aligncenter alignright alignjustify | bullist numlist | forecolor backcolor | " +
          "table | removeformat",

        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
      }}
      onEditorChange={(newContent) => {
        if (onChange) {
          onChange(newContent);
        }
      }}
    />
  );
};

export default React.memo(LessonEditor);
