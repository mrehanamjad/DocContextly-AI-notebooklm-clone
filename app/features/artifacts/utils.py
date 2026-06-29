import requests


class PexelsService:
    BASE_URL = "https://api.pexels.com/v1/search"

    def __init__(self, api_key: str):
        self.headers = {
            "Authorization": api_key
        }

    def search_image(self, query: str) -> str | None:
        """
        Returns the best landscape image URL for a query.
        """

        response = requests.get(
            self.BASE_URL,
            headers=self.headers,
            params={
                "query": query,
                "per_page": 1,
                "orientation": "landscape"
            },
            timeout=10,
        )

        response.raise_for_status()

        photos = response.json().get("photos", [])

        if not photos:
            return None

        return photos[0]["src"]["large"]
    

import requests


class IconifyService:
    SEARCH_URL = "https://api.iconify.design/search"

    def __init__(self, preferred_prefix="lucide"):
        self.preferred_prefix = preferred_prefix

    def search_icon(self, query: str) -> str | None:
        """
        Returns an Iconify icon name like:
        lucide:brain
        """

        r = requests.get(
            self.SEARCH_URL,
            params={
                "query": query
            },
            timeout=10,
        )

        r.raise_for_status()

        icons = r.json().get("icons", [])

        if not icons:
            return None

        # Prefer one icon pack
        for icon in icons:
            if icon.startswith(self.preferred_prefix + ":"):
                return icon

        return icons[0]