package service

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"github.com/mark3d-xyz/mark3d/indexer/models"
	"github.com/mark3d-xyz/mark3d/indexer/pkg/mail"
	authserver_pb "github.com/mark3d-xyz/mark3d/indexer/proto"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func grpcErrToHTTP(err error) *models.ErrorResponse {
	if err == nil {
		return nil
	}
	s := status.Convert(err)
	hs := http.StatusInternalServerError

	switch s.Code() {
	case codes.InvalidArgument:
		hs = http.StatusBadRequest
	case codes.Unauthenticated:
		hs = http.StatusUnauthorized
	case codes.NotFound:
		hs = http.StatusNotFound
	}

	return &models.ErrorResponse{
		Code:    int64(hs),
		Message: s.Message(),
	}
}

type emailVerificationTemplateParams struct {
	Name               string
	VerifyUrl          string
	ProfileSettingsUrl string
	BottomFilename     string
	LogoFilename       string
}

type emailTransferNotificationTemplateParams struct {
	BuyerName          string
	OwnerName          string
	TokenName          string
	TokenUrl           string
	ProfileSettingsUrl string
	BottomFilename     string
	LogoFilename       string
}

type emailBuyNotificationTemplateParams struct {
	OwnerName          string
	BuyerName          string
	TokenName          string
	TokenUrl           string
	Price              string
	Currency           string
	ProfileSettingsUrl string
	BottomFilename     string
	LogoFilename       string
}

func (s *service) sendEmail(templateName, email, subject, tag string, data any) error {
	templateDirPath := filepath.Join("resources", "email_templates", templateName)
	templatePath := filepath.Join(templateDirPath, "email.html")
	h, err := os.ReadFile(templatePath)

	// fix for outlook tags to be rendered
	tmpl, err := template.New("").Funcs(template.FuncMap{
		"safe": func(s string) template.HTML {
			return template.HTML(s)
		},
	}).Parse(string(h))
	if err != nil {
		return fmt.Errorf("failed to create html template: %w", err)
	}

	html, err := renderHTMLToString(tmpl, data)
	if err != nil {
		log.Fatal("ren ", err)
	}

	bottomAttachment := mail.Attachment{
		Name:        "bottom.png",
		ContentID:   "cid:bottompng",
		ContentType: "image/png",
	}
	bottomAttachmentBytes, err := os.ReadFile(filepath.Join(templateDirPath, bottomAttachment.Name))
	if err != nil {
		return fmt.Errorf("faied to read template attachment: %w", err)
	}
	bottomAttachment.Content = base64.StdEncoding.EncodeToString(bottomAttachmentBytes)

	logoAttachment := mail.Attachment{
		Name:        "logo.png",
		ContentID:   "cid:logopng",
		ContentType: "image/png",
	}
	logoAttachmentBytes, err := os.ReadFile(filepath.Join(templateDirPath, logoAttachment.Name))
	if err != nil {
		return fmt.Errorf("faied to read template attachment: %w", err)
	}
	logoAttachment.Content = base64.StdEncoding.EncodeToString(logoAttachmentBytes)

	if err := s.emailSender.SendEmail(
		subject,
		html,
		tag,
		[]string{email},
		nil,
		nil,
		[]mail.Attachment{bottomAttachment, logoAttachment},
	); err != nil {
		log.Fatal("failed to send email", err)
	}
	return nil
}

func renderHTMLToString(tmpl *template.Template, data any) (string, error) {
	var buf bytes.Buffer
	err := tmpl.Execute(&buf, data)
	if err != nil {
		return "", err
	}
	return buf.String(), nil
}

func fillCollectionUserProfiles(
	c *models.Collection,
	owner *authserver_pb.UserProfileShort,
	creator *authserver_pb.UserProfileShort,
) {
	c.OwnerProfile.Username = owner.Username
	c.OwnerProfile.Name = owner.Name
	c.OwnerProfile.AvatarURL = owner.AvatarURL
	c.CreatorProfile.Username = creator.Username
	c.CreatorProfile.Name = creator.Name
	c.CreatorProfile.AvatarURL = creator.AvatarURL
}

func fillTokenUserProfiles(
	t *models.Token,
	owner *authserver_pb.UserProfileShort,
	creator *authserver_pb.UserProfileShort,
) {
	t.OwnerProfile.Username = owner.Username
	t.OwnerProfile.Name = owner.Name
	t.OwnerProfile.AvatarURL = owner.AvatarURL
	t.CreatorProfile.Username = creator.Username
	t.CreatorProfile.Name = creator.Name
	t.CreatorProfile.AvatarURL = creator.AvatarURL
}

func fillTransferUserProfiles(
	t *models.Transfer,
	to *authserver_pb.UserProfileShort,
	from *authserver_pb.UserProfileShort,
) {
	t.ToProfile.Username = to.Username
	t.ToProfile.Name = to.Name
	t.ToProfile.AvatarURL = to.AvatarURL
	t.FromProfile.Username = from.Username
	t.FromProfile.Name = from.Name
	t.FromProfile.AvatarURL = from.AvatarURL
}
