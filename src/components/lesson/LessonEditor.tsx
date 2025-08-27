import React from "react";
import { Editor } from "@tinymce/tinymce-react";

const LessonEditor = ({ value, onChange }) => {
  return (
    <Editor
      apiKey="d2aps4bpv6af7eanl13t0uv4pbwzmgyfleocul7rn1k6915d"
      value={value || "<p>Escreva o conteúdo da questão aqui.</p>"}
      init={{
        height: 400, // Aumentei um pouco a altura
        menubar: false,

        // 1. Adicione os plugins para as novas funcionalidades
        plugins: [
          "autolink",
          "lists",
          "link",
          "image",
          "table",
          "wordcount",
          "fullscreen",
        ],

        // 2. Monte a barra de ferramentas como preferir
        toolbar:
          // Linha 1: Desfazer/Refazer, Estilos de bloco, Negrito/Itálico/Sublinhado
          "undo redo |  blocks | fontselect fontsizeselect | bold italic underline | " +
          // Linha 2: Alinhamento, Listas, Cores
          "alignleft aligncenter alignright alignjustify | bullist numlist | forecolor backcolor | " +
          // Linha 3: Inserir elementos e ferramentas
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
