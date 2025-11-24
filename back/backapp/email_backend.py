"""
Custom email backend to handle SSL certificate verification issues.
For development only - should not be used in production.
"""
import ssl
import smtplib
from django.core.mail.backends.smtp import EmailBackend as SMTPEmailBackend


class CustomSMTPEmailBackend(SMTPEmailBackend):
    """
    Custom SMTP email backend that disables SSL certificate verification.
    WARNING: This is for development only. Do not use in production.
    """
    
    def open(self):
        """
        Override to create SSL context without certificate verification.
        """
        if self.connection:
            return False
        
        try:
            # Get local_hostname if it exists, otherwise use None
            local_hostname = getattr(self, 'local_hostname', None)
            self.connection = smtplib.SMTP(
                self.host, self.port, local_hostname=local_hostname
            )
            
            if self.use_tls:
                # Create SSL context without certificate verification
                context = ssl.create_default_context()
                context.check_hostname = False
                context.verify_mode = ssl.CERT_NONE
                self.connection.starttls(context=context)
            
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            
            return True
        except Exception:
            if not self.fail_silently:
                raise

