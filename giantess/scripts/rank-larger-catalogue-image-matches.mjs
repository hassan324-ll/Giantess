import fs from "node:fs";
import path from "node:path";

const outputDirectory = "bulk-product-cleanup-review";
const readJson = (filename) =>
  JSON.parse(fs.readFileSync(path.join(outputDirectory, filename), "utf8").replace(/^\uFEFF/, ""));

const current = readJson("current-image-hashes.json");
const catalogue = readJson("catalogue-image-hashes.json");

function hammingDistance(left, right) {
  let distance = 0;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) distance += 1;
  }
  return distance;
}

function csvValue(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function writeCsv(filename, rows) {
  const headers = [
    "current_file",
    "current_width",
    "current_height",
    "catalogue_file",
    "catalogue_width",
    "catalogue_height",
    "hash_distance",
    "review_candidate",
  ];
  const lines = [
    headers.map(csvValue).join(","),
    ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(",")),
  ];
  fs.writeFileSync(path.join(outputDirectory, filename), `${lines.join("\n")}\n`);
}

const matches = [];
for (const image of current) {
  let best = null;
  for (const candidate of catalogue) {
    if (candidate.max_size <= image.max_size) continue;
    const hashDistance = hammingDistance(image.hash, candidate.hash);
    if (!best || hashDistance < best.hash_distance) {
      best = {
        current_file: image.file,
        current_width: image.width,
        current_height: image.height,
        catalogue_file: candidate.file,
        catalogue_width: candidate.width,
        catalogue_height: candidate.height,
        hash_distance: hashDistance,
        review_candidate: hashDistance <= 5,
      };
    }
  }
  if (best) matches.push(best);
}

matches.sort((left, right) =>
  left.hash_distance - right.hash_distance || left.current_file.localeCompare(right.current_file),
);
const reviewCandidates = matches.filter((match) => match.review_candidate);

writeCsv("catalogue-nearest-larger-images.csv", matches);
writeCsv("catalogue-larger-review-candidates.csv", reviewCandidates);

console.log(`Current images with a larger catalogue candidate: ${matches.length}`);
console.log(`Close visual matches requiring review: ${reviewCandidates.length}`);
