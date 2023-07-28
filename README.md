# Fordító

A laravel fordítója alapján készült `__(key,replace)` function. (Laravel nélküli használat is lehetséges, ekkor a lejjebb leírt mappa és fájlelérés koncepció egyedileg kezelendő, csak figyelni kell, hogy ne legyen átfedés a key-ek között.)

## Install

Két window változó létrehozása szükséges: a <head> tag-ben:

```
<script>
    window._locale = '{!! app()->getLocale() !!}';
    window._translations = {!! $translations !!};
</script>
```

Az `window._locale` értéke határozza meg, hogy melyik első szinten kell keresni a fordításokat, általában `'hu'`.

A `window._translations` változóból fog dolgozni a fordító, így épül fel json-ként:

```json
{
    hu: {
        vue/login/error_messages: {
            password: {
                'null_pass': 'Üres jelszó!'
            }
                
        }
    }
}
```

Ebben a jsonben a szintek a következőek, laravel specifikusan:

```
hu - window._locale értéke és az első mappa a lang mappán belül.
vue/login/error_messages - ez a php fájlelérés a lang/$locale mappában, ahol az asszociatív tömb összeépül.
password - tömbben található első szint
null_pass - fordítandó key
```

## Tipp

Laravelben a legegyszerűbb módja, annak, hogy a backenden meghatározott fájlokat tudjuk használni, ha első betöltéskor beolvassuk az összes fájlt a laravel `lang/locale` mappából. Ehhez alkalmazható a következő ServiceProvider:
```
class TranslationServiceProvider extends ServiceProvider
{
    public function boot()
    {
        $translations = collect();
        $locale = App::getLocale();
        $translations[$locale] = $this->Translations($locale);
        view()->share('translations', $translations);
    }

    private function Translations($locale)
    {
        $folder = Config::get('app.translation_to_vue');
        $path = resource_path("lang/$locale/" . $folder);
        return collect(File::allFiles($path))->flatMap(function ($file) use ($locale) {
            $dir = str_replace(resource_path() . "/lang/" . $locale, '', $file->getPath()) . "/";
            $key = ($translation = $file->getBasename('.php'));
            return [ltrim($dir, '/') . $key => trans($dir . $translation, [], $locale)];
        });
    }
}
```

A példában van egy `Config::get('app.translation_to_vue')`, hogy el lehessen különíteni a backendet és a frontendet, valamint egyszerre egy nyelvet kezel.

## Usage

```
import translation from "translation";

app.mixin(translation);
```

### key paraméter

A `key` paraméterben megadjuk, az `app()->getLocale()`, tehát `hu` mappán belüli fájlelérést `/` jelekkel tagolva az almappákat. Ha eljutunk a fájl nevéig, utána a belső szinteket `.` írásjellel kell tagolni. 

**Fájl:**

`lang/hu/vue/login/error_messages.php`

**Tartalma:**
```
<?php

return [
    'password' => [
        'null_pass' => 'Üres jelszó!',
    ]
]
```

**Kiírása:**
```
__('vue/login/error_messages.password.null_pass');
```

### replace paraméter

A `replace` paraméterben egy objecttel megadható, hogy mit és mire szeretnénk kicserélni. Ehhez a tömbben az érték megadásakor object kulcsa `:key` lecserélődik az object értékére.

**Fájl:**

`lang/hu/vue/login/error_messages.php`

**Tartalma:**
```
<?php

return [
    'password' => [
        'too_short' => 'A jelszó minimum :n db karakter legyen!',
    ]
]
```

**Kiírása:**
```
__('vue/login/error_messages.password.too_short', {n: 8});
```
