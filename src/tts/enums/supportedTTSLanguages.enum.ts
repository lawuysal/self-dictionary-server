export const SupportedTTSLanguages = new Map([
  ["TURKISH", { languageCode: "tr-TR", name: "tr-TR-Standard-D" }],
  ["GERMAN", { languageCode: "de-DE", name: "de-DE-Standard-D" }],
  ["ENGLISH", { languageCode: "en-US", name: "en-US-Standard-A" }],
  ["SPANISH", { languageCode: "es-ES", name: "es-ES-Standard-B" }],
  ["FRENCH", { languageCode: "fr-FR", name: "fr-FR-Standard-B" }],
]);

export enum SupportedTTSLanguagesEnum {
  TURKISH = "TURKISH",
  GERMAN = "GERMAN",
  ENGLISH = "ENGLISH",
  SPANISH = "SPANISH",
  FRENCH = "FRENCH",
}
