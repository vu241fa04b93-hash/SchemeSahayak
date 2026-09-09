class SchemeRegistry:
    """
    Stores scheme IDs and their corresponding PDF paths.

    Scheme information can be provided dynamically by
    the scheme-data module.
    """

    def __init__(self, schemes=None):
        self.schemes = schemes or {}

    def add_scheme(
        self,
        scheme_id: str,
        pdf_path: str
    ):
        if not scheme_id:
            raise ValueError(
                "scheme_id is required"
            )

        if not pdf_path:
            raise ValueError(
                "pdf_path is required"
            )

        self.schemes[scheme_id] = pdf_path

    def get_pdf_path(
        self,
        scheme_id: str
    ):
        if scheme_id not in self.schemes:
            raise KeyError(
                f"Scheme not found: {scheme_id}"
            )

        return self.schemes[scheme_id]

    def has_scheme(
        self,
        scheme_id: str
    ):
        return scheme_id in self.schemes

    def get_all_schemes(self):
        return self.schemes.copy()