# Aplikacja „Trening”: jak ją mieć na telefonie i komputerze

## Co już jest
- Pełna aplikacja w tym folderze: trening (seria jednym dotknięciem, przerwy, interwały), dieta (baza podstawowa, kod kreskowy, własne produkty), suplementy, postęp i waga, tryb ciemny.
- Działa bez internetu. Dane zapisują się na urządzeniu.
- Nic nie trzeba instalować na Macu i nic nie kosztuje.

## Adres aplikacji
**https://aisolutionspolska.github.io/trening/**

(Repozytorium: https://github.com/aisolutionspolska/trening – publiczne, bo darmowe GitHub Pages tego wymaga. W kodzie nie ma Twoich danych; dane są tylko w telefonie.)

## Krok 1. GitHub Pages – zrobione 23.11.2026
Gdyby trzeba było powtórzyć ręcznie:
1. Załóż na GitHubie nowe repozytorium, np. `trening`.
2. Wrzuć do niego zawartość folderu `aplikacja`.
3. W repozytorium wejdź w Settings → Pages → Source: „Deploy from a branch”, gałąź `main`, folder `/ (root)`.
4. Po minucie aplikacja jest pod adresem `https://<twoja-nazwa>.github.io/trening/`.

## Krok 2. iPhone
1. Otwórz adres w **Safari**.
2. Przycisk „Udostępnij” → „Do ekranu początkowego”.
3. Masz ikonę jak zwykła aplikacja. Otwiera się na pełnym ekranie i działa offline.

## Krok 3. Laptop / komputer
- Chrome albo Edge: ikona instalacji w pasku adresu → „Zainstaluj”.
- Mac + Safari: Plik → „Dodaj do Docka”.

## Ważne
- **Dane są osobno na każdym urządzeniu.** Synchronizacji telefon ↔ komputer jeszcze nie ma (to następny etap, np. darmowy Firebase).
- **Kopia zapasowa:** Dziś → zębatka → „Zapisz kopię”. Plik można wczytać na innym urządzeniu („Wczytaj kopię”).
- **Skaner kodów aparatem** działa w Chrome (Android, komputer). Na iPhonie Safari nie ma czytnika kodów w przeglądarce, więc wpisujesz cyfry spod kodu – produkt pobiera się sam z bazy Open Food Facts.
- **Wyszukiwarka produktów po nazwie** korzysta z Open Food Facts, która bywa przeciążona. Wtedy działają: kod kreskowy, baza podstawowa i własne produkty.
- **Ciężary startowe** przy pierwszym treningu są szacunkowe – jeśli nie pasują, „Zrobiłem inaczej” i wybierasz właściwy. Od drugiego treningu aplikacja liczy sama.
- **Serie i powtórzenia** są ustawione według researchu (np. główne 4 × 5–6, akcesoria 3 × 8–12). Zmiana: w pliku `js/plan.js`.
