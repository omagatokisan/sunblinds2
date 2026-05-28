<?php
declare(strict_types=1);
require __DIR__ . '/_lib.php';
sb_cors();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $store = sb_read_reviews_store();
    if (empty($store['enabled'])) {
        sb_send_json(200, ['reviews' => [], 'enabled' => false]);
    }

    $approved = [];
    foreach ($store['reviews'] ?? [] as $review) {
        if (is_array($review) && ($review['status'] ?? '') === 'approved') {
            $approved[] = $review;
        }
    }

    sb_send_json(200, ['reviews' => $approved, 'enabled' => true]);
}

if ($method !== 'POST') {
    sb_send_json(405, ['error' => 'Metoda není povolena.']);
}

$data = sb_json_input();
if (!$data) sb_send_json(400, ['error' => 'Neplatná data.']);

$author = sb_str($data['author'] ?? '', 120);
$text = sb_str($data['text'] ?? '', 150);
$location = sb_str($data['location'] ?? '', 120);
$productHint = sb_str($data['productHint'] ?? '', 200);
$rating = (int)($data['rating'] ?? 0);

if (strlen($author) < 2) {
    sb_send_json(400, ['error' => 'Napište prosím jméno (alespoň 2 znaky).']);
}
if (strlen($text) < 3) {
    sb_send_json(400, ['error' => 'Napište krátkou zkušenost (alespoň 3 znaky).']);
}
if (strlen($text) > 150) {
    sb_send_json(400, ['error' => 'Text recenze může mít nejvýše 150 znaků.']);
}
if ($rating < 1 || $rating > 5) {
    sb_send_json(400, ['error' => 'Vyberte hodnocení hvězdičkami.']);
}

$store = sb_read_reviews_store();
if (empty($store['enabled'])) {
    sb_send_json(403, ['error' => 'Recenze jsou dočasně vypnuté.']);
}

$review = [
    'id' => 'rev-' . bin2hex(random_bytes(4)),
    'author' => $author,
    'rating' => $rating,
    'text' => $text,
    'source' => 'customer',
    'status' => 'approved',
    'createdAt' => date('Y-m-d'),
];

if ($location !== '') $review['location'] = $location;
if ($productHint !== '') $review['productHint'] = $productHint;

if (!isset($store['reviews']) || !is_array($store['reviews'])) {
    $store['reviews'] = [];
}
array_unshift($store['reviews'], $review);

if (!sb_write_reviews_store($store)) {
    sb_send_json(500, ['error' => 'Uložení recenze se nezdařilo.']);
}

$cfg = sb_config();
$body = "Nová recenze na webu\n\n";
$body .= "Autor: {$author}\n";
$body .= "Hodnocení: {$rating}/5\n";
if ($location !== '') $body .= "Místo: {$location}\n";
if ($productHint !== '') $body .= "Produkt: {$productHint}\n";
$body .= "\nText:\n{$text}\n";
sb_send_mail('Recenze — ' . ($cfg['site_name'] ?? 'SunBlinds'), $body);

sb_send_json(200, ['ok' => true, 'review' => $review]);
